"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceController = void 0;
const logger_1 = require("../infrastructure/logging/logger");
class BalanceController {
    reportingService;
    logger;
    constructor(reportingService) {
        this.reportingService = reportingService;
        this.logger = new logger_1.Logger({ service: 'BalanceController' });
    }
    /**
     * GET /api/v1/reports/balance/:date
     * Get daily balance for a specific date
     */
    async getDailyBalance(req, res) {
        try {
            const { date } = req.params;
            this.logger.info('Getting daily balance', { date });
            const balance = await this.reportingService.getDailyBalance(date);
            if (!balance) {
                res.status(404).json({
                    success: false,
                    error: 'Balance not found',
                    message: `No balance found for ${date}`,
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: balance,
            });
        }
        catch (error) {
            this.logger.error('Error getting daily balance', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Failed to get daily balance',
                message: error.message,
            });
        }
    }
    /**
     * GET /api/v1/reports/balance/history
     * Get balance history for a date range
     */
    async getBalanceHistory(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required parameters',
                    message: 'startDate and endDate are required',
                });
                return;
            }
            this.logger.info('Getting balance history', { startDate, endDate });
            const result = await this.reportingService.getBalanceHistory({
                startDate: startDate,
                endDate: endDate,
            });
            res.status(200).json({
                success: true,
                data: result.history,
                summary: result.summary,
            });
        }
        catch (error) {
            this.logger.error('Error getting balance history', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Failed to get balance history',
                message: error.message,
            });
        }
    }
    /**
     * GET /api/v1/reports/balance/chart
     * Get balance chart data (simplified for visualization)
     */
    async getBalanceChart(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required parameters',
                    message: 'startDate and endDate are required',
                });
                return;
            }
            this.logger.info('Getting balance chart', { startDate, endDate });
            const result = await this.reportingService.getBalanceHistory({
                startDate: startDate,
                endDate: endDate,
            });
            // Format data for charts
            const chartData = result.history.map((day) => ({
                date: day.date,
                balance: Number(day.closingBalance),
                credits: Number(day.totalCredits),
                debits: Number(day.totalDebits),
            }));
            res.status(200).json({
                success: true,
                data: chartData,
                summary: result.summary,
            });
        }
        catch (error) {
            this.logger.error('Error getting balance chart', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Failed to get balance chart',
                message: error.message,
            });
        }
    }
}
exports.BalanceController = BalanceController;
// Made with Bob
//# sourceMappingURL=balance.controller.js.map