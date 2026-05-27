import { Transaction } from '../entities/transaction.entity';

export interface FindTransactionsOptions {
  type?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface TransactionRepository {
  /**
   * Save a transaction (create or update)
   */
  save(transaction: Transaction): Promise<Transaction>;

  /**
   * Find a transaction by ID
   */
  findById(id: string): Promise<Transaction | null>;

  /**
   * Find transactions with filters
   */
  findMany(options: FindTransactionsOptions): Promise<Transaction[]>;

  /**
   * Count transactions with filters
   */
  count(options: FindTransactionsOptions): Promise<number>;

  /**
   * Delete a transaction (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a transaction exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Find a transaction by idempotency key
   */
  findByIdempotencyKey(idempotencyKey: string): Promise<Transaction | null>;
}

// Made with Bob
