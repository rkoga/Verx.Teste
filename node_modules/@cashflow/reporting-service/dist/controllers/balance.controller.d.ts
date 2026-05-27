import { Request, Response } from 'express';
import { ReportingService } from '../services/reporting.service';
export declare class BalanceController {
    private reportingService;
    private logger;
    constructor(reportingService: ReportingService);
    /**
     * GET /api/v1/reports/balance/:date
     * Get daily balance for a specific date
     */
    getDailyBalance(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/v1/reports/balance/history
     * Get balance history for a date range
     */
    getBalanceHistory(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/v1/reports/balance/chart
     * Get balance chart data (simplified for visualization)
     */
    getBalanceChart(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=balance.controller.d.ts.map