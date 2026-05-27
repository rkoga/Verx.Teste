import { BaseDomainEvent, DomainEventMetadata } from '@shared/domain/events/domain-event.interface';

export interface TransactionCreatedEventPayload {
  transactionId: string;
  merchantId: string;
  amount: number;
  currency: string;
  type: string;
  timestamp: Date;
}

export class TransactionCreatedEvent extends BaseDomainEvent<TransactionCreatedEventPayload> {
  constructor(
    payload: TransactionCreatedEventPayload,
    metadata?: Partial<DomainEventMetadata>,
  ) {
    super(
      'transaction.created',
      payload.transactionId,
      'Transaction',
      payload,
      metadata,
    );
  }
}

// Made with Bob
