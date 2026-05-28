"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../logging/logger");
class PrismaService {
    constructor() {
        this.logger = new logger_1.Logger({ service: 'PrismaService' });
        this.prisma = new client_1.PrismaClient({
            log: [
                { level: 'query', emit: 'event' },
                { level: 'error', emit: 'event' },
                { level: 'warn', emit: 'event' },
            ],
        });
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.prisma.$on('query', (e) => {
            this.logger.debug('Query executed', {
                query: e.query,
                duration: `${e.duration}ms`,
            });
        });
        this.prisma.$on('error', (e) => {
            this.logger.error('Prisma error', { error: e.message });
        });
        this.prisma.$on('warn', (e) => {
            this.logger.warn('Prisma warning', { message: e.message });
        });
    }
    async connect() {
        try {
            await this.prisma.$connect();
            this.logger.info('Database connection established');
        }
        catch (error) {
            this.logger.error('Failed to connect to database', { error });
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.prisma.$disconnect();
            this.logger.info('Database connection closed');
        }
        catch (error) {
            this.logger.error('Error disconnecting from database', { error });
            throw error;
        }
    }
    getClient() {
        return this.prisma;
    }
    async healthCheck() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            this.logger.error('Database health check failed', { error });
            return false;
        }
    }
}
exports.PrismaService = PrismaService;
// Made with Bob
//# sourceMappingURL=prisma.service.js.map