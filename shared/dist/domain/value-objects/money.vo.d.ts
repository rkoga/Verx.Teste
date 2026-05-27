export declare class Money {
    private readonly _amount;
    private readonly _currency;
    constructor(amount: number, currency?: string);
    get amount(): number;
    get value(): number;
    get currency(): string;
    isNegative(): boolean;
    isZero(): boolean;
    isPositive(): boolean;
    add(other: Money): Money;
    subtract(other: Money): Money;
    multiply(factor: number): Money;
    divide(divisor: number): Money;
    equals(other: Money): boolean;
    isGreaterThan(other: Money): boolean;
    isLessThan(other: Money): boolean;
    private assertSameCurrency;
    toString(): string;
    toJSON(): {
        amount: number;
        currency: string;
    };
    static fromJSON(json: {
        amount: number;
        currency: string;
    }): Money;
    static zero(currency?: string): Money;
}
//# sourceMappingURL=money.vo.d.ts.map