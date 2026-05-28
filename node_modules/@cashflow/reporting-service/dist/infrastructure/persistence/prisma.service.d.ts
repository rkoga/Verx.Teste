import { PrismaClient } from '@prisma/client';
export declare class PrismaService {
    private prisma;
    private logger;
    constructor();
    private setupEventHandlers;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getClient(): PrismaClient;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=prisma.service.d.ts.map