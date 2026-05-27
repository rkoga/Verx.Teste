export interface LoggerConfig {
    level?: string;
    service?: string;
    environment?: string;
}
export declare class Logger {
    private logger;
    constructor(config?: LoggerConfig);
    info(message: string, meta?: Record<string, any>): void;
    error(message: string, error?: Error | Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    debug(message: string, meta?: Record<string, any>): void;
    child(meta: Record<string, any>): Logger;
}
export declare function getLogger(config?: LoggerConfig): Logger;
//# sourceMappingURL=logger.d.ts.map