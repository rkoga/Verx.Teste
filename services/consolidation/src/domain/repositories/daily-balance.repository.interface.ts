import { DailyBalance } from '../entities/daily-balance.entity';

export interface FindDailyBalanceOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface DailyBalanceRepository {
  /**
   * Save a daily balance (create or update)
   */
  save(balance: DailyBalance): Promise<DailyBalance>;

  /**
   * Find a daily balance by date
   */
  findByDate(date: Date): Promise<DailyBalance | null>;

  /**
   * Find daily balances with filters
   */
  findMany(options: FindDailyBalanceOptions): Promise<DailyBalance[]>;

  /**
   * Find the most recent balance before a given date
   */
  findPreviousBalance(date: Date): Promise<DailyBalance | null>;

  /**
   * Count daily balances with filters
   */
  count(options: FindDailyBalanceOptions): Promise<number>;

  /**
   * Delete a daily balance
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a balance exists for a date
   */
  exists(date: Date): Promise<boolean>;
}

// Made with Bob