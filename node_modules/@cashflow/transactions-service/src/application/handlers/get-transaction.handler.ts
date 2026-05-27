import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { GetTransactionQuery } from '../queries/get-transaction.query';
import { TransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Logger } from '@shared/infrastructure/logging/logger';

@Injectable()
export class GetTransactionHandler {
  private readonly logger: Logger;

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {
    this.logger = new Logger({ service: 'transactions-service' });
  }

  async execute(query: GetTransactionQuery): Promise<Transaction> {
    this.logger.debug('Getting transaction', {
      transactionId: query.transactionId,
    });

    const transaction = await this.transactionRepository.findById(query.transactionId);

    if (!transaction) {
      throw new NotFoundException(`Transaction ${query.transactionId} not found`);
    }

    return transaction;
  }
}

// Made with Bob