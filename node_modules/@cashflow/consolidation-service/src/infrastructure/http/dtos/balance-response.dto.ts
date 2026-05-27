import { ApiProperty } from '@nestjs/swagger';
import { DailyBalance } from '../../../domain/entities/daily-balance.entity';

export class BalanceResponseDto {
  @ApiProperty({
    description: 'Balance ID',
    example: 'bal_1234567890_abc123',
  })
  id: string;

  @ApiProperty({
    description: 'Balance date',
    example: '2026-05-26',
  })
  date: string;

  @ApiProperty({
    description: 'Opening balance',
    example: 1000.00,
  })
  openingBalance: number;

  @ApiProperty({
    description: 'Total credits for the day',
    example: 500.00,
  })
  totalCredits: number;

  @ApiProperty({
    description: 'Total debits for the day',
    example: 200.00,
  })
  totalDebits: number;

  @ApiProperty({
    description: 'Closing balance',
    example: 1300.00,
  })
  closingBalance: number;

  @ApiProperty({
    description: 'Number of transactions',
    example: 15,
  })
  transactionCount: number;

  @ApiProperty({
    description: 'Consolidation timestamp',
    example: '2026-05-26T14:00:00.000Z',
  })
  consolidatedAt: string;

  static fromEntity(balance: DailyBalance): BalanceResponseDto {
    return {
      id: balance.id,
      date: balance.date.toISOString().split('T')[0],
      openingBalance: balance.openingBalance.value,
      totalCredits: balance.totalCredits.value,
      totalDebits: balance.totalDebits.value,
      closingBalance: balance.closingBalance.value,
      transactionCount: balance.transactionCount,
      consolidatedAt: balance.consolidatedAt.toISOString(),
    };
  }
}

// Made with Bob