import { PrismaClient } from '.prisma/client-reporting';
import { RedisService } from '../infrastructure/cache/redis.service';
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
export declare class ReportingService {
    private prisma;
    private redis;
    private logger;
    private readonly DEFAULT_TTL;
    private readonly BALANCE_TTL;
    private readonly DASHBOARD_TTL;
    constructor(prisma: PrismaClient, redis: RedisService);
    /**
     * Get transactions with filters and caching
     */
    getTransactions(filters?: TransactionFilters): Promise<any>;
    /**
     * Get daily balance for a specific date
     */
    getDailyBalance(date: string): Promise<any>;
    /**
     * Get balance history for a date range
     */
    getBalanceHistory(filters: BalanceHistoryFilters): Promise<any>;
    /**
     * Get dashboard data with statistics
     */
    getDashboard(): Promise<any>;
    /**
     * Get category summary for a specific month
     */
    getCategorySummary(month: string): Promise<any>;
    /**
     * Invalidate all cache
     */
    invalidateCache(): Promise<void>;
}
//# sourceMappingURL=reporting.service.d.ts.map