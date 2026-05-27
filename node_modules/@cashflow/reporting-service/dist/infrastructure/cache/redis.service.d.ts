export declare class RedisService {
    private client;
    private logger;
    private isConnected;
    constructor();
    private setupEventHandlers;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    delPattern(pattern: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    ttl(key: string): Promise<number>;
    isHealthy(): boolean;
    static generateTransactionKey(filters: any): string;
    static generateBalanceKey(date: string): string;
    static generateBalanceHistoryKey(startDate: string, endDate: string): string;
    static generateDashboardKey(): string;
    static generateStatisticsKey(): string;
    static generateCategorySummaryKey(month: string): string;
}
//# sourceMappingURL=redis.service.d.ts.map