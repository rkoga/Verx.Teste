import { createClient, RedisClientType } from 'redis';
import { Logger } from '../logging/logger';

export class RedisService {
  private client: RedisClientType;
  private logger: Logger;
  private isConnected: boolean = false;

  constructor() {
    this.logger = new Logger({ service: 'RedisService' });
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            this.logger.error('Redis reconnection failed after 10 attempts');
            return new Error('Redis reconnection failed');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', { error: err.message });
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      this.logger.info('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      this.logger.info('Redis Client Ready');
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('Redis Client Reconnecting');
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.logger.info('Redis connection established');
    } catch (error) {
      this.logger.error('Failed to connect to Redis', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
      this.logger.info('Redis connection closed');
    } catch (error) {
      this.logger.error('Error disconnecting from Redis', { error });
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) {
        this.logger.debug('Cache miss', { key });
        return null;
      }
      this.logger.debug('Cache hit', { key });
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error('Error getting value from cache', { key, error });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      this.logger.debug('Value cached', { key, ttl: ttlSeconds });
    } catch (error) {
      this.logger.error('Error setting value in cache', { key, error });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
      this.logger.debug('Cache key deleted', { key });
    } catch (error) {
      this.logger.error('Error deleting cache key', { key, error });
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        this.logger.debug('Cache keys deleted by pattern', { pattern, count: keys.length });
      }
    } catch (error) {
      this.logger.error('Error deleting cache keys by pattern', { pattern, error });
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error('Error checking key existence', { key, error });
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error('Error getting TTL', { key, error });
      return -1;
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  // Cache key generators
  static generateTransactionKey(filters: any): string {
    const filterStr = JSON.stringify(filters);
    return `transactions:${Buffer.from(filterStr).toString('base64')}`;
  }

  static generateBalanceKey(date: string): string {
    return `balance:${date}`;
  }

  static generateBalanceHistoryKey(startDate: string, endDate: string): string {
    return `balance-history:${startDate}:${endDate}`;
  }

  static generateDashboardKey(): string {
    return `dashboard`;
  }

  static generateStatisticsKey(): string {
    return `statistics`;
  }

  static generateCategorySummaryKey(month: string): string {
    return `category-summary:${month}`;
  }
}

// Made with Bob
