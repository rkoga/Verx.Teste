import { Money } from '@shared/domain/value-objects/money.vo';
import { TransactionType } from '../value-objects/transaction-type.vo';
import { TransactionCreatedEvent } from '../events/transaction-created.event';
import { TransactionCancelledEvent } from '../events/transaction-cancelled.event';

export interface TransactionProps {
  id?: string;
  amount: Money;
  type: TransactionType;
  description?: string;
  categoryId?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
}

export class Transaction {
  private readonly _id: string;
  private readonly _amount: Money;
  private readonly _type: TransactionType;
  private readonly _description?: string;
  private readonly _categoryId?: string;
  private readonly _metadata?: Record<string, any>;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _cancelledAt?: Date;
  private _cancelReason?: string;
  private _domainEvents: any[] = [];

  constructor(props: TransactionProps) {
    this._id = props.id || this.generateId();
    this._amount = props.amount;
    this._type = props.type;
    this._description = props.description;
    this._categoryId = props.categoryId;
    this._metadata = props.metadata;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._cancelledAt = props.cancelledAt;
    this._cancelReason = props.cancelReason;

    this.validate();
  }

  private generateId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (this._amount.isNegative()) {
      throw new Error('Transaction amount cannot be negative');
    }

    if (this._amount.isZero()) {
      throw new Error('Transaction amount cannot be zero');
    }
  }

  // Factory Methods
  static create(props: Omit<TransactionProps, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const transaction = new Transaction({
      ...props,
    });

    transaction.addDomainEvent(
      new TransactionCreatedEvent({
        transactionId: transaction.id,
        merchantId: 'default',
        amount: transaction.amount.value,
        currency: transaction.amount.currency,
        type: transaction.type.value,
        timestamp: transaction.createdAt,
      })
    );

    return transaction;
  }

  static reconstitute(props: TransactionProps): Transaction {
    if (!props.id) {
      throw new Error('ID is required to reconstitute a transaction');
    }
    return new Transaction(props);
  }

  // Business Logic
  cancel(reason: string): void {
    if (this._cancelledAt) {
      throw new Error('Transaction is already cancelled');
    }

    if (this._type.isCredit()) {
      throw new Error('Credit transactions cannot be cancelled');
    }

    this._cancelledAt = new Date();
    this._cancelReason = reason;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new TransactionCancelledEvent({
        transactionId: this._id,
        merchantId: 'default',
        reason,
        timestamp: this._cancelledAt,
      })
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get amount(): Money {
    return this._amount;
  }

  get type(): TransactionType {
    return this._type;
  }

  get description(): string | undefined {
    return this._description;
  }

  get categoryId(): string | undefined {
    return this._categoryId;
  }

  get metadata(): Record<string, any> | undefined {
    return this._metadata;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get cancelledAt(): Date | undefined {
    return this._cancelledAt;
  }

  get cancelReason(): string | undefined {
    return this._cancelReason;
  }

  get domainEvents(): any[] {
    return this._domainEvents;
  }

  // Domain Events
  private addDomainEvent(event: any): void {
    this._domainEvents.push(event);
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  // Helper Methods
  isDebit(): boolean {
    return this._type.isDebit();
  }

  isCredit(): boolean {
    return this._type.isCredit();
  }

  isCancelled(): boolean {
    return !!this._cancelledAt;
  }

  toJSON(): Record<string, any> {
    return {
      id: this._id,
      amount: this._amount.value,
      currency: this._amount.currency,
      type: this._type.value,
      description: this._description,
      categoryId: this._categoryId,
      metadata: this._metadata,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      cancelledAt: this._cancelledAt?.toISOString(),
      cancelReason: this._cancelReason,
    };
  }
}

// Made with Bob
