import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { CreateTransactionCommand } from '../commands/create-transaction.command';
import { TransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionType } from '../../domain/value-objects/transaction-type.vo';
import { Money } from '@shared/domain/value-objects/money.vo';
import { Logger } from '@shared/infrastructure/logging/logger';

@Injectable()
export class CreateTransactionHandler {
  private readonly logger: Logger;

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {
    this.logger = new Logger({ service: 'transactions-service' });
  }

  async execute(command: CreateTransactionCommand): Promise<Transaction> {
    this.logger.info('Creating transaction', {
      type: command.type,
      amount: command.amount,
      idempotencyKey: command.idempotencyKey,
    });

    // Validate amount
    if (command.amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    // Create transaction entity
    const transaction = Transaction.create({
      amount: new Money(command.amount),
      type: TransactionType.fromString(command.type),
      description: command.description,
      categoryId: command.categoryId,
      metadata: { idempotencyKey: command.idempotencyKey },
    });

    // Save transaction
    const savedTransaction = await this.transactionRepository.save(transaction);

    this.logger.info('Transaction created successfully', {
      transactionId: savedTransaction.id,
    });

    return savedTransaction;
  }
}

// Made with Bob