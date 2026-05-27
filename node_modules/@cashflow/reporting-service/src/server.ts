import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import { PrismaService } from './infrastructure/persistence/prisma.service';
import { RedisService } from './infrastructure/cache/redis.service';
import { ReportingService } from './services/reporting.service';
import { createRoutes } from './routes';
import { Logger } from './infrastructure/logging/logger';

// Load environment variables
config();

const logger = new Logger({ service: 'ReportingServer' });

class ReportingServer {
  private app: Application;
  private prismaService: PrismaService;
  private redisService: RedisService;
  private reportingService: ReportingService;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3003', 10);
    this.prismaService = new PrismaService();
    this.redisService = new RedisService();
    this.reportingService = new ReportingService(
      this.prismaService.getClient(),
      this.redisService
    );

    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    // Security
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
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

  private setupRoutes(): void {
    // Root endpoint
    this.app.get('/', (_req: Request, res: Response) => {
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
    const routes = createRoutes(
      this.reportingService,
      this.prismaService,
      this.redisService
    );
    this.app.use(routes);

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
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

  async start(): Promise<void> {
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
    } catch (error: any) {
      logger.error('Failed to start server', { error: error.message });
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    try {
      logger.info('Shutting down server...');
      
      await this.prismaService.disconnect();
      logger.info('Database disconnected');
      
      await this.redisService.disconnect();
      logger.info('Redis disconnected');
      
      logger.info('Server shut down successfully');
      process.exit(0);
    } catch (error: any) {
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

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection', { reason });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  server.stop();
});

// Start the server
server.start();

// Made with Bob
