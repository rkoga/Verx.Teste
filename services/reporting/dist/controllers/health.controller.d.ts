import { Request, Response } from 'express';
import { PrismaService } from '../infrastructure/persistence/prisma.service';
import { RedisService } from '../infrastructure/cache/redis.service';
export declare class HealthController {
    private prismaService;
    private redisService;
    private logger;
    constructor(prismaService: PrismaService, redisService: RedisService);
    /**
     * GET /api/v1/health
     * Health check endpoint
     */
    check(_req: Request, res: Response): Promise<void>;
    /**
     * GET /api/v1/health/ready
     * Readiness probe
     */
    ready(_req: Request, res: Response): Promise<void>;
    /**
     * GET /api/v1/health/live
     * Liveness probe
     */
    live(_req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=health.controller.d.ts.map