"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
class Money {
    _amount;
    _currency;
    constructor(amount, currency = 'BRL') {
        if (!Number.isFinite(amount)) {
            throw new Error('Amount must be a finite number');
        }
        this._amount = Math.round(amount * 100) / 100; // Round to 2 decimal places
        this._currency = currency;
    }
    get amount() {
        return this._amount;
    }
    get value() {
        return this._amount;
    }
    get currency() {
        return this._currency;
    }
    isNegative() {
        return this._amount < 0;
    }
    isZero() {
        return this._amount === 0;
    }
    isPositive() {
        return this._amount > 0;
    }
    add(other) {
        this.assertSameCurrency(other);
        return new Money(this._amount + other._amount, this._currency);
    }
    subtract(other) {
        this.assertSameCurrency(other);
        return new Money(this._amount - other._amount, this._currency);
    }
    multiply(factor) {
        return new Money(this._amount * factor, this._currency);
    }
    divide(divisor) {
        if (divisor === 0) {
            throw new Error('Cannot divide by zero');
        }
        return new Money(this._amount / divisor, this._currency);
    }
    equals(other) {
        return this._amount === other._amount && this._currency === other._currency;
    }
    isGreaterThan(other) {
        this.assertSameCurrency(other);
        return this._amount > other._amount;
    }
    isLessThan(other) {
        this.assertSameCurrency(other);
        return this._amount < other._amount;
    }
    assertSameCurrency(other) {
        if (this._currency !== other._currency) {
            throw new Error(`Currency mismatch: ${this._currency} vs ${other._currency}`);
        }
    }
    toString() {
        return `${this._currency} ${this._amount.toFixed(2)}`;
    }
    toJSON() {
        return {
            amount: this._amount,
            currency: this._currency,
        };
    }
    static fromJSON(json) {
        return new Money(json.amount, json.currency);
    }
    static zero(currency = 'BRL') {
        return new Money(0, currency);
    }
}
exports.Money = Money;
// Made with Bob
//# sourceMappingURL=money.vo.js.map