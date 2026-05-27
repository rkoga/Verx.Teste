import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './infrastructure/http/controllers/health.controller';
import { TransactionsController } from './infrastructure/http/controllers/transactions.controller';
import { PrismaService } from './infrastructure/persistence/prisma.service';
import { PrismaTransactionRepository } from './infrastructure/persistence/transaction.repository';
import {
  CreateTransactionHandler,
  GetTransactionHandler,
  ListTransactionsHandler,
} from './application/handlers';

const TRANSACTION_REPOSITORY = 'TransactionRepository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [
    HealthController,
    TransactionsController,
  ],
  providers: [
    PrismaService,
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: PrismaTransactionRepository,
    },
    CreateTransactionHandler,
    GetTransactionHandler,
    ListTransactionsHandler,
  ],
})
export class AppModule {}

// Made with Bob
