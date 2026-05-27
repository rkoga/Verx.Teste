import { Request, Response } from 'express';
import { PrismaService } from '../infrastructure/persistence/prisma.service';
import { RedisService } from '../infrastructure/cache/redis.service';
import { Logger } from '../infrastructure/logging/logger';

export class HealthController {
  private prismaService: PrismaService;
  private redisService: RedisService;
  private logger: Logger;

  constructor(prismaService: PrismaService, redisService: RedisService) {
    this.prismaService = prismaService;
    this.redisService = redisService;
    this.logger = new Logger({ service: 'HealthController' });
  }

  /**
   * GET /api/v1/health
   * Health check endpoint
   */
  async check(_req: Request, res: Response): Promise<void> {
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
      } else {
        this.logger.warn('Health check failed', health);
      }

      res.status(statusCode).json(health);
    } catch (error: any) {
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
  async ready(_req: Request, res: Response): Promise<void> {
    try {
      const dbHealthy = await this.prismaService.healthCheck();
      const redisHealthy = this.redisService.isHealthy();

      if (dbHealthy && redisHealthy) {
        res.status(200).json({ status: 'ready' });
      } else {
        res.status(503).json({ status: 'not ready' });
      }
    } catch (error: any) {
      res.status(503).json({ status: 'not ready', error: error.message });
    }
  }

  /**
   * GET /api/v1/health/live
   * Liveness probe
   */
  async live(_req: Request, res: Response): Promise<void> {
    res.status(200).json({ status: 'alive' });
  }
}

// Made with Bob
