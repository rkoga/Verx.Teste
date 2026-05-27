import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  DailyBalanceRepository,
  FindDailyBalanceOptions,
} from '../../domain/repositories/daily-balance.repository.interface';
import { DailyBalance } from '../../domain/entities/daily-balance.entity';
import { Money } from '@shared/domain/value-objects/money.vo';
import { DailyBalance as PrismaDailyBalance } from '.prisma/client-consolidation';

@Injectable()
export class PrismaDailyBalanceRepository implements DailyBalanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(balance: DailyBalance): Promise<DailyBalance> {
    const data = {
      date: balance.date,
      openingBalance: balance.openingBalance.value,
      totalCredits: balance.totalCredits.value,
      totalDebits: balance.totalDebits.value,
      closingBalance: balance.closingBalance.value,
      transactionCount: balance.transactionCount,
      consolidatedAt: balance.consolidatedAt,
    };

    let prismaBalance: PrismaDailyBalance;

    // Check if balance exists
    const existing = await this.prisma.dailyBalance.findUnique({
      where: {
        date: balance.date,
      },
    });

    if (existing) {
      // Update existing balance
      prismaBalance = await this.prisma.dailyBalance.update({
        where: {
          date: balance.date,
        },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new balance
      prismaBalance = await this.prisma.dailyBalance.create({
        data: {
          ...data,
          id: balance.id,
        },
      });
    }

    return this.toDomain(prismaBalance);
  }

  async findByDate(date: Date): Promise<DailyBalance | null> {
    const balance = await this.prisma.dailyBalance.findUnique({
      where: {
        date,
      },
    });

    return balance ? this.toDomain(balance) : null;
  }

  async findMany(options: FindDailyBalanceOptions): Promise<DailyBalance[]> {
    const where: any = {};

    if (options.startDate || options.endDate) {
      where.date = {};
      if (options.startDate) {
        where.date.gte = options.startDate;
      }
      if (options.endDate) {
        where.date.lte = options.endDate;
      }
    }

    const balances = await this.prisma.dailyBalance.findMany({
      where,
      take: options.limit,
      skip: options.offset,
      orderBy: { date: 'desc' },
    });

    return balances.map((b) => this.toDomain(b));
  }

  async findPreviousBalance(date: Date): Promise<DailyBalance | null> {
    const balance = await this.prisma.dailyBalance.findFirst({
      where: {
        date: {
          lt: date,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return balance ? this.toDomain(balance) : null;
  }

  async count(options: FindDailyBalanceOptions): Promise<number> {
    const where: any = {};

    if (options.startDate || options.endDate) {
      where.date = {};
      if (options.startDate) {
        where.date.gte = options.startDate;
      }
      if (options.endDate) {
        where.date.lte = options.endDate;
      }
    }

    return this.prisma.dailyBalance.count({ where });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.dailyBalance.delete({
      where: { id },
    });
  }

  async exists(date: Date): Promise<boolean> {
    const count = await this.prisma.dailyBalance.count({
      where: {
        date,
      },
    });
    return count > 0;
  }

  private toDomain(prismaBalance: PrismaDailyBalance): DailyBalance {
    return DailyBalance.reconstitute({
      id: prismaBalance.id,
      date: prismaBalance.date,
      openingBalance: new Money(Number(prismaBalance.openingBalance)),
      totalCredits: new Money(Number(prismaBalance.totalCredits)),
      totalDebits: new Money(Number(prismaBalance.totalDebits)),
      closingBalance: new Money(Number(prismaBalance.closingBalance)),
      transactionCount: prismaBalance.transactionCount,
      consolidatedAt: prismaBalance.consolidatedAt,
      createdAt: prismaBalance.createdAt,
      updatedAt: prismaBalance.updatedAt,
    });
  }
}

// Made with Bob