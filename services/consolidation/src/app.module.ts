import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './infrastructure/http/controllers/health.controller';
import { ConsolidationController } from './infrastructure/http/controllers/consolidation.controller';
import { PrismaService } from './infrastructure/persistence/prisma.service';
import { PrismaDailyBalanceRepository } from './infrastructure/persistence/daily-balance.repository';
import { ConsolidationService } from './application/services/consolidation.service';

const DAILY_BALANCE_REPOSITORY = 'DailyBalanceRepository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    HealthController,
    ConsolidationController,
  ],
  providers: [
    PrismaService,
    {
      provide: DAILY_BALANCE_REPOSITORY,
      useClass: PrismaDailyBalanceRepository,
    },
    ConsolidationService,
  ],
})
export class AppModule {}

// Made with Bob