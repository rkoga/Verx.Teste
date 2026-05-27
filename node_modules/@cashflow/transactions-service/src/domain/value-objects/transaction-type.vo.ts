export enum TransactionTypeEnum {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export class TransactionType {
  private readonly _value: TransactionTypeEnum;

  private constructor(value: TransactionTypeEnum) {
    this._value = value;
  }

  static debit(): TransactionType {
    return new TransactionType(TransactionTypeEnum.DEBIT);
  }

  static credit(): TransactionType {
    return new TransactionType(TransactionTypeEnum.CREDIT);
  }

  static fromString(value: string): TransactionType {
    const upperValue = value.toUpperCase();
    
    if (upperValue === TransactionTypeEnum.DEBIT) {
      return TransactionType.debit();
    }
    
    if (upperValue === TransactionTypeEnum.CREDIT) {
      return TransactionType.credit();
    }
    
    throw new Error(`Invalid transaction type: ${value}`);
  }

  get value(): TransactionTypeEnum {
    return this._value;
  }

  isDebit(): boolean {
    return this._value === TransactionTypeEnum.DEBIT;
  }

  isCredit(): boolean {
    return this._value === TransactionTypeEnum.CREDIT;
  }

  equals(other: TransactionType): boolean {
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
