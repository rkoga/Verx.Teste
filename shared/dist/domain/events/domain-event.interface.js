"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDomainEvent = void 0;
class BaseDomainEvent {
    eventId;
    eventType;
    aggregateId;
    aggregateType;
    occurredAt;
    version;
    payload;
    metadata;
    constructor(eventType, aggregateId, aggregateType, payload, metadata = {}) {
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
    generateEventId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateCorrelationId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    toJSON() {
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
exports.BaseDomainEvent = BaseDomainEvent;
// Made with Bob
//# sourceMappingURL=domain-event.interface.js.map