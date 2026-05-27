import { Money } from '@shared/domain/value-objects/money.vo';

export interface DailyBalanceProps {
  id?: string;
  date: Date;
  openingBalance: Money;
  totalCredits: Money;
  totalDebits: Money;
  closingBalance: Money;
  transactionCount: number;
  consolidatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DailyBalance {
  private readonly _id: string;
  private readonly _date: Date;
  private _openingBalance: Money;
  private _totalCredits: Money;
  private _totalDebits: Money;
  private _closingBalance: Money;
  private _transactionCount: number;
  private _consolidatedAt: Date;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: DailyBalanceProps) {
    this._id = props.id || this.generateId();
    this._date = props.date;
    this._openingBalance = props.openingBalance;
    this._totalCredits = props.totalCredits;
    this._totalDebits = props.totalDebits;
    this._closingBalance = props.closingBalance;
    this._transactionCount = props.transactionCount;
    this._consolidatedAt = props.consolidatedAt || new Date();
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  private generateId(): string {
    return `bal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (!this._date) {
      throw new Error('Date is required');
    }

    if (this._transactionCount < 0) {
      throw new Error('Transaction count cannot be negative');
    }
  }

  // Factory Methods
  static create(props: Omit<DailyBalanceProps, 'id' | 'consolidatedAt' | 'createdAt' | 'updatedAt'>): DailyBalance {
    return new DailyBalance(props);
  }

  static reconstitute(props: DailyBalanceProps): DailyBalance {
    if (!props.id) {
      throw new Error('ID is required to reconstitute a daily balance');
    }
    return new DailyBalance(props);
  }

  // Business Logic
  recalculate(): void {
    // Closing Balance = Opening Balance + Credits - Debits
    this._closingBalance = this._openingBalance
      .add(this._totalCredits)
      .subtract(this._totalDebits);
    this._updatedAt = new Date();
  }

  addCredit(amount: Money): void {
    this._totalCredits = this._totalCredits.add(amount);
    this._transactionCount++;
    this.recalculate();
  }

  addDebit(amount: Money): void {
    this._totalDebits = this._totalDebits.add(amount);
    this._transactionCount++;
    this.recalculate();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get date(): Date {
    return this._date;
  }

  get openingBalance(): Money {
    return this._openingBalance;
  }

  get totalCredits(): Money {
    return this._totalCredits;
  }

  get totalDebits(): Money {
    return this._totalDebits;
  }

  get closingBalance(): Money {
    return this._closingBalance;
  }

  get transactionCount(): number {
    return this._transactionCount;
  }

  get consolidatedAt(): Date {
    return this._consolidatedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Helper Methods
  isBalanced(): boolean {
    const calculated = this._openingBalance
      .add(this._totalCredits)
      .subtract(this._totalDebits);
    return calculated.equals(this._closingBalance);
  }

  toJSON(): Record<string, any> {
    return {
      id: this._id,
      date: this._date.toISOString().split('T')[0],
      openingBalance: this._openingBalance.value,
      totalCredits: this._totalCredits.value,
      totalDebits: this._totalDebits.value,
      closingBalance: this._closingBalance.value,
      transactionCount: this._transactionCount,
      consolidatedAt: this._consolidatedAt.toISOString(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}

// Made with Bob