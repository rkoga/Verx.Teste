"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const logger_1 = require("../infrastructure/logging/logger");
class HealthController {
    prismaService;
    redisService;
    logger;
    constructor(prismaService, redisService) {
        this.prismaService = prismaService;
        this.redisService = redisService;
        this.logger = new logger_1.Logger({ service: 'HealthController' });
    }
    /**
     * GET /api/v1/health
     * Health check endpoint
     */
    async check(_req, res) {
        try {
            const startTime = Date.now();
            // Check database
            const dbHealthy = await this.prismaService.healthCheck();
            // Check Redis
            const redisHealthy = this.redisService.isHealthy();
            const responseTime = Date.now() - startTime;
            const status = dbHealthy && redisHealthy ? 'healthy' : 'unhealthy';
            const statusCode = status === 'healthy' ? 200 : 503;
            const health = {
                status,
                timestamp: new Date().toISOString(),
                service: 'reporting-service',
                version: process.env.npm_package_version || '1.0.0',
                uptime: process.uptime(),
                responseTime: `${responseTime}ms`,
                checks: {
                    database: {
                        status: dbHealthy ? 'up' : 'down',
                    },
                    redis: {
                        status: redisHealthy ? 'up' : 'down',
                    },
                },
            };
            if (status === 'healthy') {
                this.logger.debug('Health check passed', health);
            }
            else {
                this.logger.warn('Health check failed', health);
            }
            res.status(statusCode).json(health);
        }
        catch (error) {
            this.logger.error('Health check error', { error: error.message });
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                service: 'reporting-service',
                error: error.message,
            });
        }
    }
    /**
     * GET /api/v1/health/ready
     * Readiness probe
     */
    async ready(_req, res) {
        try {
            const dbHealthy = await this.prismaService.healthCheck();
            const redisHealthy = this.redisService.isHealthy();
            if (dbHealthy && redisHealthy) {
                res.status(200).json({ status: 'ready' });
            }
            else {
                res.status(503).json({ status: 'not ready' });
            }
        }
        catch (error) {
            res.status(503).json({ status: 'not ready', error: error.message });
        }
    }
    /**
     * GET /api/v1/health/live
     * Liveness probe
     */
    async live(_req, res) {
        res.status(200).json({ status: 'alive' });
    }
}
exports.HealthController = HealthController;
// Made with Bob
//# sourceMappingURL=health.controller.js.map