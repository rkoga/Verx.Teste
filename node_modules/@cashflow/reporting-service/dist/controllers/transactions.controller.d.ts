import { Request, Response } from 'express';
import { ReportingService } from '../services/reporting.service';
export declare class TransactionsController {
    private reportingService;
    private logger;
    constructor(reportingService: ReportingService);
    /**
     * GET /api/v1/reports/transactions
     * Get transactions with filters
     */
    getTransactions(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/v1/reports/transactions/export
     * Export transactions to CSV
     */
    exportTransactions(req: Request, res: Response): Promise<void>;
    private convertToCSV;
}
//# sourceMappingURL=transactions.controller.d.ts.map