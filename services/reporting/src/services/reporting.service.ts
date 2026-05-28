import { PrismaClient } from '@prisma/client';
import { RedisService } from '../infrastructure/cache/redis.service';
import { Logger } from '../infrastructure/logging/logger';

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: 'CREDIT' | 'DEBIT';
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface BalanceHistoryFilters {
  startDate: string;
  endDate: string;
}

export class ReportingService {
  private prisma: PrismaClient;
  private redis: RedisService;
  private logger: Logger;
  private readonly DEFAULT_TTL = 300; // 5 minutes
  private readonly BALANCE_TTL = 600; // 10 minutes
  private readonly DASHBOARD_TTL = 180; // 3 minutes

  constructor(prisma: PrismaClient, redis: RedisService) {
    this.prisma = prisma;
    this.redis = redis;
    this.logger = new Logger({ service: 'ReportingService' });
  }

  /**
   * Get transactions with filters and caching
   */
  async getTransactions(filters: TransactionFilters = {}): Promise<any> {
    const cacheKey = RedisService.generateTransactionKey(filters);
    
    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.info('Transactions retrieved from cache');
      return cached;
    }

    // Build query
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.transactionDate = {};
      if (filters.startDate) where.transactionDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.transactionDate.lte = new Date(filters.endDate);
    }

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.categoryId) where.categoryId = filters.categoryId;

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amount = {};
      if (filters.minAmount !== undefined) where.amount.gte = filters.minAmount;
      if (filters.maxAmount !== undefined) where.amount.lte = filters.maxAmount;
    }

    // Execute query
    const [transactions, total] = await Promise.all([
      this.prisma.transactionReadModel.findMany({
        where,
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transactionReadModel.count({ where }),
    ]);

    const result = {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    await this.redis.set(cacheKey, result, this.DEFAULT_TTL);
    this.logger.info('Transactions retrieved from database and cached', { total });

    return result;
  }

  /**
   * Get daily balance for a specific date
   */
  async getDailyBalance(date: string): Promise<any> {
    const cacheKey = RedisService.generateBalanceKey(date);
    
    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.info('Balance retrieved from cache', { date });
      return cached;
    }

    // Parse date string to ensure it's in correct format (YYYY-MM-DD)
    // and create a Date object at midnight UTC
    const dateStr = date.includes('T') ? date.split('T')[0] : date;
    const [year, month, day] = dateStr.split('-').map(Number);
    const searchDate = new Date(Date.UTC(year, month - 1, day));

    this.logger.info('Searching for balance', {
      originalDate: date,
      parsedDate: dateStr,
      searchDate: searchDate.toISOString()
    });

    // Get from database
    const balance = await this.prisma.dailyBalanceReadModel.findUnique({
      where: {
        date: searchDate,
      },
    });

    if (!balance) {
      this.logger.warn('Balance not found', {
        date,
        searchDate: searchDate.toISOString(),
        dateStr
      });
      return null;
    }

    // Cache the result
    await this.redis.set(cacheKey, balance, this.BALANCE_TTL);
    this.logger.info('Balance retrieved from database and cached', { date });

    return balance;
  }

  /**
   * Get balance history for a date range
   */
  async getBalanceHistory(filters: BalanceHistoryFilters): Promise<any> {
    const cacheKey = RedisService.generateBalanceHistoryKey(
      filters.startDate,
      filters.endDate
    );
    
    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.info('Balance history retrieved from cache');
      return cached;
    }

    // Get from database
    const history = await this.prisma.dailyBalanceReadModel.findMany({
      where: {
        date: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate),
        },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate summary
    const summary = {
      totalDays: history.length,
      totalCredits: history.reduce((sum, day) => sum + Number(day.totalCredits), 0),
      totalDebits: history.reduce((sum, day) => sum + Number(day.totalDebits), 0),
      averageBalance: history.length > 0
        ? history.reduce((sum, day) => sum + Number(day.closingBalance), 0) / history.length
        : 0,
      minBalance: history.length > 0
        ? Math.min(...history.map(day => Number(day.closingBalance)))
        : 0,
      maxBalance: history.length > 0
        ? Math.max(...history.map(day => Number(day.closingBalance)))
        : 0,
    };

    const result = {
      history,
      summary,
    };

    // Cache the result
    await this.redis.set(cacheKey, result, this.BALANCE_TTL);
    this.logger.info('Balance history retrieved from database and cached', {
      days: history.length,
    });

    return result;
  }

  /**
   * Get dashboard data with statistics
   */
  async getDashboard(): Promise<any> {
    const cacheKey = RedisService.generateDashboardKey();
    
    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.info('Dashboard retrieved from cache');
      return cached;
    }

    // Get system statistics (first record or create default)
    const statistics = await this.prisma.systemStatistics.findFirst();

    if (!statistics) {
      this.logger.warn('Statistics not found');
      return null;
    }

    // Get recent transactions (last 10)
    const recentTransactions = await this.prisma.transactionReadModel.findMany({
      orderBy: { transactionDate: 'desc' },
      take: 10,
    });

    // Get last 7 days balance
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last7Days = await this.prisma.dailyBalanceReadModel.findMany({
      where: {
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    // Get current month category summary
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const categorySummary = await this.prisma.categorySummary.findMany({
      where: {
        month: firstDayOfMonth,
      },
      orderBy: { totalDebits: 'desc' },
    });

    const result = {
      statistics,
      recentTransactions,
      last7Days,
      categorySummary,
    };

    // Cache the result
    await this.redis.set(cacheKey, result, this.DASHBOARD_TTL);
    this.logger.info('Dashboard retrieved from database and cached');

    return result;
  }

  /**
   * Get category summary for a specific month
   */
  async getCategorySummary(month: string): Promise<any> {
    const cacheKey = RedisService.generateCategorySummaryKey(month);
    
    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.info('Category summary retrieved from cache', { month });
      return cached;
    }

    // Get from database
    const summary = await this.prisma.categorySummary.findMany({
      where: {
        month: new Date(month),
      },
      orderBy: [
        { totalDebits: 'desc' },
        { totalCredits: 'desc' },
      ],
    });

    // Cache the result
    await this.redis.set(cacheKey, summary, this.BALANCE_TTL);
    this.logger.info('Category summary retrieved from database and cached', {
      month,
      categories: summary.length,
    });

    return summary;
  }

  /**
   * Invalidate all cache
   */
  async invalidateCache(): Promise<void> {
    await Promise.all([
      this.redis.delPattern(`transactions:*`),
      this.redis.delPattern(`balance:*`),
      this.redis.delPattern(`balance-history:*`),
      this.redis.delPattern(`dashboard`),
      this.redis.delPattern(`statistics`),
      this.redis.delPattern(`category-summary:*`),
    ]);
    this.logger.info('Cache invalidated');
  }
}

// Made with Bob
