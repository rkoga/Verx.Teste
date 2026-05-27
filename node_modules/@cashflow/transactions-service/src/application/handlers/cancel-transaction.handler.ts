import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CancelTransactionCommand } from '../commands/cancel-transaction.command';
import { TransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Logger } from '@shared/infrastructure/logging/logger';

@Injectable()
export class CancelTransactionHandler {
  private readonly logger: Logger;

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {
    this.logger = new Logger({ service: 'transactions-service' });
  }

  async execute(command: CancelTransactionCommand): Promise<Transaction> {
    this.logger.info('Cancelling transaction', {
      transactionId: command.transactionId,
      reason: command.reason,
    });

    // Find transaction
    const transaction = await this.transactionRepository.findById(command.transactionId);

    if (!transaction) {
      throw new NotFoundException(`Transaction ${command.transactionId} not found`);
    }

    // Cancel transaction (domain logic)
    try {
      transaction.cancel(command.reason);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel transaction';
      throw new BadRequestException(message);
    }

    // Save updated transaction
    const updatedTransaction = await this.transactionRepository.save(transaction);

    this.logger.info('Transaction cancelled successfully', {
      transactionId: updatedTransaction.id,
    });

    return updatedTransaction;
  }
}

// Made with Bob