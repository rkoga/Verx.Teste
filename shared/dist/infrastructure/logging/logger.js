"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.getLogger = getLogger;
const winston_1 = __importDefault(require("winston"));
class Logger {
    logger;
    constructor(config = {}) {
        const { level = process.env.LOG_LEVEL || 'info', service = 'cashflow-service', environment = process.env.NODE_ENV || 'development', } = config;
        this.logger = winston_1.default.createLogger({
            level,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
            defaultMeta: {
                service,
                environment,
            },
            transports: [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, service, ...meta }) => {
                        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                        return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
                    })),
                }),
            ],
        });
        // Add file transports in production
        if (environment === 'production') {
            this.logger.add(new winston_1.default.transports.File({
                filename: 'logs/error.log',
                level: 'error',
            }));
            this.logger.add(new winston_1.default.transports.File({
                filename: 'logs/combined.log',
            }));
        }
    }
    info(message, meta) {
        this.logger.info(message, meta);
    }
    error(message, error) {
        if (error instanceof Error) {
            this.logger.error(message, {
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                },
            });
        }
        else {
            this.logger.error(message, error);
        }
    }
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    child(meta) {
        const childLogger = new Logger({
            level: this.logger.level,
            service: this.logger.defaultMeta?.service,
            environment: this.logger.defaultMeta?.environment,
        });
        childLogger.logger = this.logger.child(meta);
        return childLogger;
    }
}
exports.Logger = Logger;
// Singleton instance
let loggerInstance;
function getLogger(config) {
    if (!loggerInstance) {
        loggerInstance = new Logger(config);
    }
    return loggerInstance;
}
// Made with Bob
//# sourceMappingURL=logger.js.map