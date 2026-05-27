import { BaseDomainEvent, DomainEventMetadata } from '@shared/domain/events/domain-event.interface';

export interface TransactionCancelledEventPayload {
  transactionId: string;
  merchantId: string;
  reason: string;
  timestamp: Date;
}

export class TransactionCancelledEvent extends BaseDomainEvent<TransactionCancelledEventPayload> {
  constructor(
    payload: TransactionCancelledEventPayload,
    metadata?: Partial<DomainEventMetadata>,
  ) {
    super(
      'transaction.cancelled',
      payload.transactionId,
      'Transaction',
      payload,
      metadata,
    );
  }
}

// Made with Bob
