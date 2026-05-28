"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = require("dotenv");
const prisma_service_1 = require("./infrastructure/persistence/prisma.service");
const redis_service_1 = require("./infrastructure/cache/redis.service");
const reporting_service_1 = require("./services/reporting.service");
const routes_1 = require("./routes");
const logger_1 = require("./infrastructure/logging/logger");
// Load environment variables
(0, dotenv_1.config)();
const logger = new logger_1.Logger({ service: 'ReportingServer' });
class ReportingServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '3003', 10);
        this.prismaService = new prisma_service_1.PrismaService();
        this.redisService = new redis_service_1.RedisService();
        this.reportingService = new reporting_service_1.ReportingService(this.prismaService.getClient(), this.redisService);
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddlewares() {
        // Security
        this.app.use((0, helmet_1.default)());
        // CORS
        this.app.use((0, cors_1.default)({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
        }));
        // Compression
        this.app.use((0, compression_1.default)());
        // Body parsing
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // Request logging
        this.app.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                logger.info('HTTP Request', {
                    method: req.method,
                    path: req.path,
                    status: res.statusCode,
                    duration: `${duration}ms`,
                });
            });
            next();
        });
    }
    setupRoutes() {
        // Root endpoint
        this.app.get('/', (_req, res) => {
            res.json({
                service: 'Cash Flow Reporting Service',
                version: '1.0.0',
                status: 'running',
                endpoints: {
                    health: '/api/v1/health',
                    docs: '/api/v1/docs',
                    transactions: '/api/v1/reports/transactions/:merchantId',
                    balance: '/api/v1/reports/balance/:merchantId/:date',
                    dashboard: '/api/v1/reports/dashboard/:merchantId',
                },
            });
        });
        // API routes
        const routes = (0, routes_1.createRoutes)(this.reportingService, this.prismaService, this.redisService);
        this.app.use(routes);
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: `Route ${req.method} ${req.path} not found`,
            });
        });
    }
    setupErrorHandling() {
        this.app.use((err, req, res, _next) => {
            logger.error('Unhandled error', {
                error: err.message,
                stack: err.stack,
                path: req.path,
                method: req.method,
            });
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'production'
                    ? 'An unexpected error occurred'
                    : err.message,
            });
        });
    }
    async start() {
        try {
            // Connect to database
            logger.info('Connecting to database...');
            await this.prismaService.connect();
            logger.info('Database connected successfully');
            // Connect to Redis
            logger.info('Connecting to Redis...');
            await this.redisService.connect();
            logger.info('Redis connected successfully');
            // Start server
            this.app.listen(this.port, () => {
                logger.info(`🚀 Reporting Service started on port ${this.port}`);
                logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
                logger.info(`🔗 Health check: http://localhost:${this.port}/api/v1/health`);
            });
        }
        catch (error) {
            logger.error('Failed to start server', { error: error.message });
            process.exit(1);
        }
    }
    async stop() {
        try {
            logger.info('Shutting down server...');
            await this.prismaService.disconnect();
            logger.info('Database disconnected');
            await this.redisService.disconnect();
            logger.info('Redis disconnected');
            logger.info('Server shut down successfully');
            process.exit(0);
        }
        catch (error) {
            logger.error('Error during shutdown', { error: error.message });
            process.exit(1);
        }
    }
}
// Create and start server
const server = new ReportingServer();
// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    server.stop();
});
process.on('SIGINT', () => {
    logger.info('SIGINT received');
    server.stop();
});
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection', { reason });
});
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    server.stop();
});
// Start the server
server.start();
// Made with Bob
//# sourceMappingURL=server.js.map