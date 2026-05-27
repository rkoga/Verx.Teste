import { Request, Response } from 'express';
import { ReportingService } from '../services/reporting.service';
import { Logger } from '../infrastructure/logging/logger';

export class DashboardController {
  private reportingService: ReportingService;
  private logger: Logger;

  constructor(reportingService: ReportingService) {
    this.reportingService = reportingService;
    this.logger = new Logger({ service: 'DashboardController' });
  }

  /**
   * GET /api/v1/reports/dashboard
   * Get complete dashboard data
   */
  async getDashboard(_req: Request, res: Response): Promise<void> {
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
    } catch (error: any) {
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
  async getCategorySummary(req: Request, res: Response): Promise<void> {
    try {
      const { month } = req.query;

      // Default to current month if not provided
      const targetMonth = month
        ? (month as string)
        : new Date().toISOString().slice(0, 7) + '-01';

      this.logger.info('Getting category summary', { month: targetMonth });

      const summary = await this.reportingService.getCategorySummary(targetMonth);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
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
  async invalidateCache(_req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('Invalidating cache');

      await this.reportingService.invalidateCache();

      res.status(200).json({
        success: true,
        message: 'Cache invalidated successfully',
      });
    } catch (error: any) {
      this.logger.error('Error invalidating cache', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to invalidate cache',
        message: error.message,
      });
    }
  }
}

// Made with Bob
