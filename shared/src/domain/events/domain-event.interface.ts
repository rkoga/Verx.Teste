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

export abstract class BaseDomainEvent<T = any> implements DomainEvent<T> {
  public readonly eventId: string;
  public readonly eventType: string;
  public readonly aggregateId: string;
  public readonly aggregateType: string;
  public readonly occurredAt: Date;
  public readonly version: number;
  public readonly payload: T;
  public readonly metadata: DomainEventMetadata;

  constructor(
    eventType: string,
    aggregateId: string,
    aggregateType: string,
    payload: T,
    metadata: Partial<DomainEventMetadata> = {},
  ) {
    this.eventId = this.generateEventId();
    this.eventType = eventType;
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.occurredAt = new Date();
    this.version = 1;
    this.payload = payload;
    this.metadata = {
      correlationId: metadata.correlationId || this.generateCorrelationId(),
      causationId: metadata.causationId,
      userId: metadata.userId,
      timestamp: new Date(),
    };
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON(): Record<string, any> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      occurredAt: this.occurredAt.toISOString(),
      version: this.version,
      payload: this.payload,
      metadata: {
        ...this.metadata,
        timestamp: this.metadata.timestamp.toISOString(),
      },
    };
  }
}

// Made with Bob
