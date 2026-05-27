export enum TransactionStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class TransactionStatus {
  private readonly _value: TransactionStatusEnum;

  private constructor(value: TransactionStatusEnum) {
    this._value = value;
  }

  static pending(): TransactionStatus {
    return new TransactionStatus(TransactionStatusEnum.PENDING);
  }

  static completed(): TransactionStatus {
    return new TransactionStatus(TransactionStatusEnum.COMPLETED);
  }

  static cancelled(): TransactionStatus {
    return new TransactionStatus(TransactionStatusEnum.CANCELLED);
  }

  static fromString(value: string): TransactionStatus {
    const upperValue = value.toUpperCase();
    
    if (upperValue === TransactionStatusEnum.PENDING) {
      return TransactionStatus.pending();
    }
    
    if (upperValue === TransactionStatusEnum.COMPLETED) {
      return TransactionStatus.completed();
    }
    
    if (upperValue === TransactionStatusEnum.CANCELLED) {
      return TransactionStatus.cancelled();
    }
    
    throw new Error(`Invalid transaction status: ${value}`);
  }

  get value(): TransactionStatusEnum {
    return this._value;
  }

  isPending(): boolean {
    return this._value === TransactionStatusEnum.PENDING;
  }

  isCompleted(): boolean {
    return this._value === TransactionStatusEnum.COMPLETED;
  }

  isCancelled(): boolean {
    return this._value === TransactionStatusEnum.CANCELLED;
  }

  equals(other: TransactionStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }
}

// Made with Bob
