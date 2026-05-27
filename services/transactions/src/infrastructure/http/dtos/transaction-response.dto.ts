import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transaction } from '../../../domain/entities/transaction.entity';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: 'txn_1234567890_abc123',
  })
  id: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: 1500.00,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'BRL',
  })
  currency: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: ['CREDIT', 'DEBIT'],
    example: 'CREDIT',
  })
  type: string;

  @ApiPropertyOptional({
    description: 'Transaction description',
    example: 'Venda de produto X',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: 'cat_123',
  })
  categoryId?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-05-26T14:18:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-05-26T14:18:00.000Z',
  })
  updatedAt: string;

  @ApiPropertyOptional({
    description: 'Cancellation timestamp',
    example: '2026-05-26T15:00:00.000Z',
  })
  cancelledAt?: string;

  @ApiPropertyOptional({
    description: 'Cancellation reason',
    example: 'Customer requested cancellation',
  })
  cancelReason?: string;

  static fromEntity(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      amount: transaction.amount.value,
      currency: transaction.amount.currency,
      type: transaction.type.value,
      description: transaction.description,
      categoryId: transaction.categoryId,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      cancelledAt: transaction.cancelledAt?.toISOString(),
      cancelReason: transaction.cancelReason,
    };
  }
}

export class PaginatedTransactionResponseDto {
  @ApiProperty({
    description: 'List of transactions',
    type: [TransactionResponseDto],
  })
  data: TransactionResponseDto[];

  @ApiProperty({
    description: 'Total number of transactions',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;
}

// Made with Bob