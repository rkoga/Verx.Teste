import { Injectable, Inject } from '@nestjs/common';
import { ListTransactionsQuery } from '../queries/list-transactions.query';
import { TransactionRepository, FindTransactionsOptions } from '../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Logger } from '@shared/infrastructure/logging/logger';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ListTransactionsHandler {
  private readonly logger: Logger;

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {
    this.logger = new Logger({ service: 'transactions-service' });
  }

  async execute(query: ListTransactionsQuery): Promise<PaginatedResult<Transaction>> {
    this.logger.debug('Listing transactions', {
      page: query.page,
      limit: query.limit,
    });

    const offset = (query.page - 1) * query.limit;

    const options: FindTransactionsOptions = {
      startDate: query.startDate,
      endDate: query.endDate,
      type: query.type,
      limit: query.limit,
      offset,
    };

    const [transactions, total] = await Promise.all([
      this.transactionRepository.findMany(options),
      this.transactionRepository.count(options),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      data: transactions,
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }
}

// Made with Bob