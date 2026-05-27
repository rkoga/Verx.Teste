"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_1 = require("redis");
const logger_1 = require("../logging/logger");
class RedisService {
    client;
    logger;
    isConnected = false;
    constructor() {
        this.logger = new logger_1.Logger({ service: 'RedisService' });
        this.client = (0, redis_1.createClient)({
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
    setupEventHandlers() {
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
    async connect() {
        try {
            await this.client.connect();
            this.logger.info('Redis connection established');
        }
        catch (error) {
            this.logger.error('Failed to connect to Redis', { error });
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.client.quit();
            this.isConnected = false;
            this.logger.info('Redis connection closed');
        }
        catch (error) {
            this.logger.error('Error disconnecting from Redis', { error });
            throw error;
        }
    }
    async get(key) {
        try {
            const value = await this.client.get(key);
            if (!value) {
                this.logger.debug('Cache miss', { key });
                return null;
            }
            this.logger.debug('Cache hit', { key });
            return JSON.parse(value);
        }
        catch (error) {
            this.logger.error('Error getting value from cache', { key, error });
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, serialized);
            }
            else {
                await this.client.set(key, serialized);
            }
            this.logger.debug('Value cached', { key, ttl: ttlSeconds });
        }
        catch (error) {
            this.logger.error('Error setting value in cache', { key, error });
        }
    }
    async del(key) {
        try {
            await this.client.del(key);
            this.logger.debug('Cache key deleted', { key });
        }
        catch (error) {
            this.logger.error('Error deleting cache key', { key, error });
        }
    }
    async delPattern(pattern) {
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
                this.logger.debug('Cache keys deleted by pattern', { pattern, count: keys.length });
            }
        }
        catch (error) {
            this.logger.error('Error deleting cache keys by pattern', { pattern, error });
        }
    }
    async exists(key) {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            this.logger.error('Error checking key existence', { key, error });
            return false;
        }
    }
    async ttl(key) {
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            this.logger.error('Error getting TTL', { key, error });
            return -1;
        }
    }
    isHealthy() {
        return this.isConnected;
    }
    // Cache key generators
    static generateTransactionKey(filters) {
        const filterStr = JSON.stringify(filters);
        return `transactions:${Buffer.from(filterStr).toString('base64')}`;
    }
    static generateBalanceKey(date) {
        return `balance:${date}`;
    }
    static generateBalanceHistoryKey(startDate, endDate) {
        return `balance-history:${startDate}:${endDate}`;
    }
    static generateDashboardKey() {
        return `dashboard`;
    }
    static generateStatisticsKey() {
        return `statistics`;
    }
    static generateCategorySummaryKey(month) {
        return `category-summary:${month}`;
    }
}
exports.RedisService = RedisService;
// Made with Bob
//# sourceMappingURL=redis.service.js.map