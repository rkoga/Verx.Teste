import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TransactionTypeDto {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Unique idempotency key to prevent duplicate transactions',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsUUID()
  idempotencyKey: string;

  @ApiProperty({
    description: 'Transaction amount (must be positive)',
    example: 1500.00,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionTypeDto,
    example: TransactionTypeDto.CREDIT,
  })
  @IsEnum(TransactionTypeDto)
  type: TransactionTypeDto;

  @ApiProperty({
    description: 'Transaction date (ISO 8601 format)',
    example: '2026-05-26',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Venda de produto X',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: 'cat_123',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;
}

// Made with Bob