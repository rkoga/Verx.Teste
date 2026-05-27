import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  TransactionRepository,
  FindTransactionsOptions,
} from '../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Money } from '@shared/domain/value-objects/money.vo';
import { TransactionType } from '../../domain/value-objects/transaction-type.vo';

type PrismaTransactionType = 'CREDIT' | 'DEBIT';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(transaction: Transaction): Promise<Transaction> {
    const data = {
      amount: transaction.amount.value,
      type: transaction.type.value as PrismaTransactionType,
      date: transaction.createdAt,
      description: transaction.description || '',
      categoryId: transaction.categoryId,
      idempotencyKey: transaction.metadata?.idempotencyKey || transaction.id,
      cancelledAt: transaction.cancelledAt,
      cancelReason: transaction.cancelReason,
    };

    let prismaTransaction;

    if (transaction.id && await this.exists(transaction.id)) {
      // Update existing transaction
      prismaTransaction = await this.prisma.transactionModel.update({
        where: { id: transaction.id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new transaction
      prismaTransaction = await this.prisma.transactionModel.create({
        data: {
          ...data,
          id: transaction.id,
        },
      });
    }

    return this.toDomain(prismaTransaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transactionModel.findUnique({
      where: { id },
    });

    return transaction ? this.toDomain(transaction) : null;
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transactionModel.findUnique({
      where: { idempotencyKey },
    });

    return transaction ? this.toDomain(transaction) : null;
  }

  async findMany(options: FindTransactionsOptions): Promise<Transaction[]> {
    const where: any = {};

    if (options.type) {
      where.type = options.type;
    }

    if (options.startDate || options.endDate) {
      where.date = {};
      if (options.startDate) {
        where.date.gte = options.startDate;
      }
      if (options.endDate) {
        where.date.lte = options.endDate;
      }
    }

    const transactions = await this.prisma.transactionModel.findMany({
      where,
      take: options.limit,
      skip: options.offset,
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => this.toDomain(t));
  }

  async count(options: FindTransactionsOptions): Promise<number> {
    const where: any = {};

    if (options.type) {
      where.type = options.type;
    }

    if (options.startDate || options.endDate) {
      where.date = {};
      if (options.startDate) {
        where.date.gte = options.startDate;
      }
      if (options.endDate) {
        where.date.lte = options.endDate;
      }
    }

    return this.prisma.transactionModel.count({ where });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transactionModel.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.transactionModel.count({
      where: { id },
    });
    return count > 0;
  }

  private toDomain(prismaTransaction: any): Transaction {
    return Transaction.reconstitute({
      id: prismaTransaction.id,
      amount: new Money(Number(prismaTransaction.amount)),
      type: TransactionType.fromString(prismaTransaction.type),
      description: prismaTransaction.description,
      categoryId: prismaTransaction.categoryId || undefined,
      metadata: { idempotencyKey: prismaTransaction.idempotencyKey },
      createdAt: prismaTransaction.createdAt,
      updatedAt: prismaTransaction.updatedAt,
      cancelledAt: prismaTransaction.cancelledAt || undefined,
      cancelReason: prismaTransaction.cancelReason || undefined,
    });
  }
}

// Made with Bob
