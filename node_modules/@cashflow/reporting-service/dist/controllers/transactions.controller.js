"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const logger_1 = require("../infrastructure/logging/logger");
class TransactionsController {
    constructor(reportingService) {
        this.reportingService = reportingService;
        this.logger = new logger_1.Logger({ service: 'TransactionsController' });
    }
    /**
     * GET /api/v1/reports/transactions
     * Get transactions with filters
     */
    async getTransactions(req, res) {
        try {
            const { startDate, endDate, type, status, categoryId, minAmount, maxAmount, page, limit, } = req.query;
            this.logger.info('Getting transactions', { filters: req.query });
            const filters = {};
            if (startDate)
                filters.startDate = startDate;
            if (endDate)
                filters.endDate = endDate;
            if (type)
                filters.type = type;
            if (status)
                filters.status = status;
            if (categoryId)
                filters.categoryId = categoryId;
            if (minAmount)
                filters.minAmount = parseFloat(minAmount);
            if (maxAmount)
                filters.maxAmount = parseFloat(maxAmount);
            if (page)
                filters.page = parseInt(page);
            if (limit)
                filters.limit = parseInt(limit);
            const result = await this.reportingService.getTransactions(filters);
            res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
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
    async exportTransactions(req, res) {
        try {
            const { startDate, endDate, type, status } = req.query;
            this.logger.info('Exporting transactions');
            const filters = { limit: 10000 }; // Max export limit
            if (startDate)
                filters.startDate = startDate;
            if (endDate)
                filters.endDate = endDate;
            if (type)
                filters.type = type;
            if (status)
                filters.status = status;
            const result = await this.reportingService.getTransactions(filters);
            // Convert to CSV
            const csv = this.convertToCSV(result.data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.csv`);
            res.status(200).send(csv);
        }
        catch (error) {
            this.logger.error('Error exporting transactions', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Failed to export transactions',
                message: error.message,
            });
        }
    }
    convertToCSV(data) {
        if (data.length === 0)
            return '';
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
exports.TransactionsController = TransactionsController;
// Made with Bob
//# sourceMappingURL=transactions.controller.js.map