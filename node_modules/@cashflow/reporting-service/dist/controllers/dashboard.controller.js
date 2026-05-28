"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const logger_1 = require("../infrastructure/logging/logger");
class DashboardController {
    constructor(reportingService) {
        this.reportingService = reportingService;
        this.logger = new logger_1.Logger({ service: 'DashboardController' });
    }
    /**
     * GET /api/v1/reports/dashboard
     * Get complete dashboard data
     */
    async getDashboard(_req, res) {
        try {
            this.logger.info('Getting dashboard');
            const dashboard = await this.reportingService.getDashboard();
            if (!dashboard) {
                res.status(404).json({
                    success: false,
                    error: 'Dashboard not found',
                    message: `No dashboard data found`,
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: dashboard,
            });
        }
        catch (error) {
            this.logger.error('Error getting dashboard', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Failed to get dashboard',
                message: error.message,
            });
        }
    }
    /**
     * GET /api/v1/reports/dashboard/categories
     * Get category summary for current month
     */
    async getCategorySummary(req, res) {
        try {
            const { month } = req.query;
            // Default to current month if not provided
            const targetMonth = month
                ? month
                : new Date().toISOString().slice(0, 7) + '-01';
            this.logger.info('Getting category summary', { month: targetMonth });
            const summary = await this.reportingService.getCategorySummary(targetMonth);
            res.status(200).json({
                success: true,
                data: summary,
            });
        }
        catch (error) {
            this.logger.error('Error getting category summary', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Failed to get category summary',
                message: error.message,
            });
        }
    }
    /**
     * POST /api/v1/reports/dashboard/invalidate-cache
     * Invalidate all cache
     */
    async invalidateCache(_req, res) {
        try {
            this.logger.info('Invalidating cache');
            await this.reportingService.invalidateCache();
            res.status(200).json({
                success: true,
                message: 'Cache invalidated successfully',
            });
        }
        catch (error) {
            this.logger.error('Error invalidating cache', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Failed to invalidate cache',
                message: error.message,
            });
        }
    }
}
exports.DashboardController = DashboardController;
// Made with Bob
//# sourceMappingURL=dashboard.controller.js.map