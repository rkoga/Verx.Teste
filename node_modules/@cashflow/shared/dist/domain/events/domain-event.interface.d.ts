export interface DomainEventMetadata {
    userId?: string;
    correlationId: string;
    causationId?: string;
    timestamp: Date;
}
export interface DomainEvent<T = any> {
    eventId: string;
    eventType: string;
    aggregateId: string;
    aggregateType: string;
    occurredAt: Date;
    version: number;
    payload: T;
    metadata: DomainEventMetadata;
}
export declare abstract class BaseDomainEvent<T = any> implements DomainEvent<T> {
    readonly eventId: string;
    readonly eventType: string;
    readonly aggregateId: string;
    readonly aggregateType: string;
    readonly occurredAt: Date;
    readonly version: number;
    readonly payload: T;
    readonly metadata: DomainEventMetadata;
    constructor(eventType: string, aggregateId: string, aggregateType: string, payload: T, metadata?: Partial<DomainEventMetadata>);
    private generateEventId;
    private generateCorrelationId;
    toJSON(): Record<string, any>;
}
//# sourceMappingURL=domain-event.interface.d.ts.map