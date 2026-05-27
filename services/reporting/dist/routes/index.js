"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = createRoutes;
const express_1 = require("express");
const transactions_controller_1 = require("../controllers/transactions.controller");
const balance_controller_1 = require("../controllers/balance.controller");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const health_controller_1 = require("../controllers/health.controller");
function createRoutes(reportingService, prismaService, redisService) {
    const router = (0, express_1.Router)();
    // Initialize controllers
    const transactionsController = new transactions_controller_1.TransactionsController(reportingService);
    const balanceController = new balance_controller_1.BalanceController(reportingService);
    const dashboardController = new dashboard_controller_1.DashboardController(reportingService);
    const healthController = new health_controller_1.HealthController(prismaService, redisService);
    // Health check routes
    router.get('/health', (req, res) => healthController.check(req, res));
    router.get('/health/ready', (req, res) => healthController.ready(req, res));
    router.get('/health/live', (req, res) => healthController.live(req, res));
    // API v1 routes
    const v1Router = (0, express_1.Router)();
    // Transaction reports
    v1Router.get('/reports/transactions', (req, res) => transactionsController.getTransactions(req, res));
    v1Router.get('/reports/transactions/export', (req, res) => transactionsController.exportTransactions(req, res));
    // Balance reports - Order matters! More specific routes first
    v1Router.get('/reports/balance/history', (req, res) => balanceController.getBalanceHistory(req, res));
    v1Router.get('/reports/balance/chart', (req, res) => balanceController.getBalanceChart(req, res));
    v1Router.get('/reports/balance/:date', (req, res) => balanceController.getDailyBalance(req, res));
    // Dashboard
    v1Router.get('/reports/dashboard', (req, res) => dashboardController.getDashboard(req, res));
    v1Router.get('/reports/dashboard/categories', (req, res) => dashboardController.getCategorySummary(req, res));
    v1Router.post('/reports/dashboard/invalidate-cache', (req, res) => dashboardController.invalidateCache(req, res));
    router.use('/api/v1', v1Router);
    return router;
}
// Made with Bob
//# sourceMappingURL=index.js.map