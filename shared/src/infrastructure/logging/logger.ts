import winston from 'winston';

export interface LoggerConfig {
  level?: string;
  service?: string;
  environment?: string;
}

export class Logger {
  private logger: winston.Logger;

  constructor(config: LoggerConfig = {}) {
    const {
      level = process.env.LOG_LEVEL || 'info',
      service = 'cashflow-service',
      environment = process.env.NODE_ENV || 'development',
    } = config;

    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: {
        service,
        environment,
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
            }),
          ),
        }),
      ],
    });

    // Add file transports in production
    if (environment === 'production') {
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
      );
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      );
    }
  }

  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error | Record<string, any>): void {
    if (error instanceof Error) {
      this.logger.error(message, {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      });
    } else {
      this.logger.error(message, error);
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }

  child(meta: Record<string, any>): Logger {
    const childLogger = new Logger({
      level: this.logger.level,
      service: this.logger.defaultMeta?.service,
      environment: this.logger.defaultMeta?.environment,
    });
    childLogger.logger = this.logger.child(meta);
    return childLogger;
  }
}

// Singleton instance
let loggerInstance: Logger;

export function getLogger(config?: LoggerConfig): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger(config);
  }
  return loggerInstance;
}

// Made with Bob
