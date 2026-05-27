import { Request, Response } from 'express';
import { ReportingService } from '../services/reporting.service';
import { Logger } from '../infrastructure/logging/logger';

export class TransactionsController {
  private reportingService: ReportingService;
  private logger: Logger;

  constructor(reportingService: ReportingService) {
    this.reportingService = reportingService;
    this.logger = new Logger({ service: 'TransactionsController' });
  }

  /**
   * GET /api/v1/reports/transactions
   * Get transactions with filters
   */
  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const {
        startDate,
        endDate,
        type,
        status,
        categoryId,
        minAmount,
        maxAmount,
        page,
        limit,
      } = req.query;

      this.logger.info('Getting transactions', { filters: req.query });

      const filters: any = {};
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (type) filters.type = type as string;
      if (status) filters.status = status as string;
      if (categoryId) filters.categoryId = categoryId as string;
      if (minAmount) filters.minAmount = parseFloat(minAmount as string);
      if (maxAmount) filters.maxAmount = parseFloat(maxAmount as string);
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const result = await this.reportingService.getTransactions(filters);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      this.logger.error('Error getting transactions', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get transactions',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/v1/reports/transactions/export
   * Export transactions to CSV
   */
  async exportTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, type, status } = req.query;

      this.logger.info('Exporting transactions');

      const filters: any = { limit: 10000 }; // Max export limit
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (type) filters.type = type as string;
      if (status) filters.status = status as string;

      const result = await this.reportingService.getTransactions(filters);

      // Convert to CSV
      const csv = this.convertToCSV(result.data);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.csv`);
      res.status(200).send(csv);
    } catch (error: any) {
      this.logger.error('Error exporting transactions', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to export transactions',
        message: error.message,
      });
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = [
      'ID',
      'Category',
      'Type',
      'Amount',
      'Description',
      'Status',
      'Transaction Date',
      'Created At',
    ];

    const rows = data.map(item => [
      item.id,
      item.categoryName,
      item.type,
      item.amount,
      item.description || '',
      item.status,
      item.transactionDate,
      item.createdAt,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }
}

// Made with Bob
