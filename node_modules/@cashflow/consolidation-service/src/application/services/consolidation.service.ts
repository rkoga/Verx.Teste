import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DailyBalanceRepository } from '../../domain/repositories/daily-balance.repository.interface';
import { DailyBalance } from '../../domain/entities/daily-balance.entity';
import { Money } from '@shared/domain/value-objects/money.vo';
import { Logger } from '@shared/infrastructure/logging/logger';
import { Pool } from 'pg';

export interface TransactionData {
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  date: Date;
}

@Injectable()
export class ConsolidationService {
  private readonly logger: Logger;
  private reportingPool: Pool;

  constructor(
    @Inject('DailyBalanceRepository')
    private readonly dailyBalanceRepository: DailyBalanceRepository,
  ) {
    this.logger = new Logger({ service: 'consolidation-service' });
    
    // Initialize connection pool to reporting database
    this.reportingPool = new Pool({
      connectionString: process.env.REPORTING_DATABASE_URL ||
        'postgresql://cashflow:cashflow123@localhost:5432/reporting',
      max: 5,
    });
  }

  /**
   * Consolidate transactions for a specific date
   */
  async consolidateDay(date: Date, transactions: TransactionData[]): Promise<DailyBalance> {
    this.logger.info('Starting daily consolidation', {
      date: date.toISOString().split('T')[0],
      transactionCount: transactions.length,
    });

    // Get previous day's closing balance as opening balance
    const previousBalance = await this.dailyBalanceRepository.findPreviousBalance(date);
    const openingBalance = previousBalance 
      ? previousBalance.closingBalance 
      : Money.zero();

    // Calculate totals
    let totalCredits = Money.zero();
    let totalDebits = Money.zero();

    for (const transaction of transactions) {
      const amount = new Money(transaction.amount);
      if (transaction.type === 'CREDIT') {
        totalCredits = totalCredits.add(amount);
      } else {
        totalDebits = totalDebits.add(amount);
      }
    }

    // Calculate closing balance
    const closingBalance = openingBalance
      .add(totalCredits)
      .subtract(totalDebits);

    // Check if balance already exists
    const existingBalance = await this.dailyBalanceRepository.findByDate(date);

    let dailyBalance: DailyBalance;

    if (existingBalance) {
      // Update existing balance
      this.logger.info('Updating existing daily balance', {
        balanceId: existingBalance.id,
        date: date.toISOString().split('T')[0],
      });

      dailyBalance = DailyBalance.reconstitute({
        id: existingBalance.id,
        date,
        openingBalance,
        totalCredits,
        totalDebits,
        closingBalance,
        transactionCount: transactions.length,
        consolidatedAt: new Date(),
        createdAt: existingBalance.createdAt,
        updatedAt: new Date(),
      });
    } else {
      // Create new balance
      dailyBalance = DailyBalance.create({
        date,
        openingBalance,
        totalCredits,
        totalDebits,
        closingBalance,
        transactionCount: transactions.length,
      });
    }

    // Save balance
    const savedBalance = await this.dailyBalanceRepository.save(dailyBalance);

    // Also save to reporting database for read model
    await this.syncToReportingDatabase(savedBalance);

    this.logger.info('Daily consolidation completed', {
      balanceId: savedBalance.id,
      date: date.toISOString().split('T')[0],
      openingBalance: openingBalance.value,
      totalCredits: totalCredits.value,
      totalDebits: totalDebits.value,
      closingBalance: closingBalance.value,
      transactionCount: transactions.length,
    });

    return savedBalance;
  }

  /**
   * Sync balance to reporting database
   */
  private async syncToReportingDatabase(balance: DailyBalance): Promise<void> {
    try {
      // Format date as YYYY-MM-DD string to ensure consistent storage
      const dateStr = balance.date.toISOString().split('T')[0];
      
      const query = `
        INSERT INTO daily_balance_read_model (
          id, date, "openingBalance", "totalCredits", "totalDebits",
          "closingBalance", "transactionCount", "createdAt", "updatedAt"
        ) VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (date)
        DO UPDATE SET
          "openingBalance" = EXCLUDED."openingBalance",
          "totalCredits" = EXCLUDED."totalCredits",
          "totalDebits" = EXCLUDED."totalDebits",
          "closingBalance" = EXCLUDED."closingBalance",
          "transactionCount" = EXCLUDED."transactionCount",
          "updatedAt" = EXCLUDED."updatedAt"
      `;

      this.logger.info('Syncing balance to reporting database', {
        balanceId: balance.id,
        date: dateStr,
        openingBalance: balance.openingBalance.value,
        closingBalance: balance.closingBalance.value,
      });

      await this.reportingPool.query(query, [
        balance.id,
        dateStr,
        balance.openingBalance.value,
        balance.totalCredits.value,
        balance.totalDebits.value,
        balance.closingBalance.value,
        balance.transactionCount,
        balance.createdAt,
        balance.updatedAt,
      ]);

      this.logger.info('Successfully synced balance to reporting database', {
        balanceId: balance.id,
        date: dateStr,
      });
    } catch (error: any) {
      this.logger.error('Failed to sync to reporting database', {
        error: error.message,
        stack: error.stack,
        balanceId: balance.id,
        date: balance.date.toISOString().split('T')[0],
      });
      // Don't throw - consolidation should succeed even if sync fails
    }
  }

  /**
   * Get balance for a specific date
   */
  async getBalance(date: Date): Promise<DailyBalance | null> {
    return this.dailyBalanceRepository.findByDate(date);
  }

  /**
   * Get balance history
   */
  async getBalanceHistory(
    startDate: Date,
    endDate: Date,
  ): Promise<DailyBalance[]> {
    return this.dailyBalanceRepository.findMany({
      startDate,
      endDate,
    });
  }

  /**
   * Scheduled job to consolidate previous day's transactions
   * Runs every hour at minute 0
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledConsolidation() {
    this.logger.info('Starting scheduled consolidation job');

    try {
      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      this.logger.info('Scheduled consolidation completed', {
        date: yesterday.toISOString().split('T')[0],
      });
    } catch (error) {
      this.logger.error('Scheduled consolidation failed', error as Error);
    }
  }
}

// Made with Bob