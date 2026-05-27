import { Router } from 'express';
import { ReportingService } from '../services/reporting.service';
import { PrismaService } from '../infrastructure/persistence/prisma.service';
import { RedisService } from '../infrastructure/cache/redis.service';
export declare function createRoutes(reportingService: ReportingService, prismaService: PrismaService, redisService: RedisService): Router;
//# sourceMappingURL=index.d.ts.map