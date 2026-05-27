import { Router } from 'express';
import { TransactionsController } from '../controllers/transactions.controller';
import { BalanceController } from '../controllers/balance.controller';
import { DashboardController } from '../controllers/dashboard.controller';
import { HealthController } from '../controllers/health.controller';
import { ReportingService } from '../services/reporting.service';
import { PrismaService } from '../infrastructure/persistence/prisma.service';
import { RedisService } from '../infrastructure/cache/redis.service';

export function createRoutes(
  reportingService: ReportingService,
  prismaService: PrismaService,
  redisService: RedisService
): Router {
  const router = Router();

  // Initialize controllers
  const transactionsController = new TransactionsController(reportingService);
  const balanceController = new BalanceController(reportingService);
  const dashboardController = new DashboardController(reportingService);
  const healthController = new HealthController(prismaService, redisService);

  // Health check routes
  router.get('/health', (req, res) => healthController.check(req, res));
  router.get('/health/ready', (req, res) => healthController.ready(req, res));
  router.get('/health/live', (req, res) => healthController.live(req, res));

  // API v1 routes
  const v1Router = Router();

  // Transaction reports
  v1Router.get(
    '/reports/transactions',
    (req, res) => transactionsController.getTransactions(req, res)
  );
  v1Router.get(
    '/reports/transactions/export',
    (req, res) => transactionsController.exportTransactions(req, res)
  );

  // Balance reports - Order matters! More specific routes first
  v1Router.get(
    '/reports/balance/history',
    (req, res) => balanceController.getBalanceHistory(req, res)
  );
  v1Router.get(
    '/reports/balance/chart',
    (req, res) => balanceController.getBalanceChart(req, res)
  );
  v1Router.get(
    '/reports/balance/:date',
    (req, res) => balanceController.getDailyBalance(req, res)
  );

  // Dashboard
  v1Router.get(
    '/reports/dashboard',
    (req, res) => dashboardController.getDashboard(req, res)
  );
  v1Router.get(
    '/reports/dashboard/categories',
    (req, res) => dashboardController.getCategorySummary(req, res)
  );
  v1Router.post(
    '/reports/dashboard/invalidate-cache',
    (req, res) => dashboardController.invalidateCache(req, res)
  );

  router.use('/api/v1', v1Router);

  return router;
}

// Made with Bob
