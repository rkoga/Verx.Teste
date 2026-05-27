import { PrismaClient } from '.prisma/client-reporting';
import { Logger } from '../logging/logger';

export class PrismaService {
  private prisma: PrismaClient;
  private logger: Logger;

  constructor() {
    this.logger = new Logger({ service: 'PrismaService' });
    this.prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.prisma.$on('query' as never, (e: any) => {
      this.logger.debug('Query executed', {
        query: e.query,
        duration: `${e.duration}ms`,
      });
    });

    this.prisma.$on('error' as never, (e: any) => {
      this.logger.error('Prisma error', { error: e.message });
    });

    this.prisma.$on('warn' as never, (e: any) => {
      this.logger.warn('Prisma warning', { message: e.message });
    });
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      this.logger.info('Database connection established');
    } catch (error) {
      this.logger.error('Failed to connect to database', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      this.logger.info('Database connection closed');
    } catch (error) {
      this.logger.error('Error disconnecting from database', { error });
      throw error;
    }
  }

  getClient(): PrismaClient {
    return this.prisma;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', { error });
      return false;
    }
  }
}

// Made with Bob
