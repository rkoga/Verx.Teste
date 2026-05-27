import { Request, Response } from 'express';
import { ReportingService } from '../services/reporting.service';
export declare class DashboardController {
    private reportingService;
    private logger;
    constructor(reportingService: ReportingService);
    /**
     * GET /api/v1/reports/dashboard
     * Get complete dashboard data
     */
    getDashboard(_req: Request, res: Response): Promise<void>;
    /**
     * GET /api/v1/reports/dashboard/categories
     * Get category summary for current month
     */
    getCategorySummary(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/v1/reports/dashboard/invalidate-cache
     * Invalidate all cache
     */
    invalidateCache(_req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map