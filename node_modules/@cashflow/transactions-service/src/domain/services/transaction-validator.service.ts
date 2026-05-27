import { Money } from '@shared/domain/value-objects/money.vo';
import { TransactionType } from '../value-objects/transaction-type.vo';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class TransactionValidatorService {
  private readonly MIN_AMOUNT = 0.01;
  private readonly MAX_AMOUNT = 1000000;
  private readonly ALLOWED_CURRENCIES = ['BRL', 'USD', 'EUR'];

  /**
   * Validate transaction amount
   */
  validateAmount(amount: Money): ValidationResult {
    const errors: string[] = [];

    if (amount.isNegative()) {
      errors.push('Transaction amount cannot be negative');
    }

    if (amount.isZero()) {
      errors.push('Transaction amount cannot be zero');
    }

    if (amount.value < this.MIN_AMOUNT) {
      errors.push(`Transaction amount must be at least ${this.MIN_AMOUNT}`);
    }

    if (amount.value > this.MAX_AMOUNT) {
      errors.push(`Transaction amount cannot exceed ${this.MAX_AMOUNT}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate currency
   */
  validateCurrency(currency: string): ValidationResult {
    const errors: string[] = [];

    if (!this.ALLOWED_CURRENCIES.includes(currency)) {
      errors.push(`Currency ${currency} is not supported. Allowed: ${this.ALLOWED_CURRENCIES.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate merchant ID
   */
  validateMerchantId(merchantId: string): ValidationResult {
    const errors: string[] = [];

    if (!merchantId || merchantId.trim().length === 0) {
      errors.push('Merchant ID is required');
    }

    if (merchantId && merchantId.length < 3) {
      errors.push('Merchant ID must be at least 3 characters');
    }

    if (merchantId && merchantId.length > 100) {
      errors.push('Merchant ID cannot exceed 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate transaction type
   */
  validateTransactionType(type: TransactionType): ValidationResult {
    const errors: string[] = [];

    if (!type) {
      errors.push('Transaction type is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate description
   */
  validateDescription(description?: string): ValidationResult {
    const errors: string[] = [];

    if (description && description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate complete transaction data
   */
  validateTransaction(data: {
    merchantId: string;
    amount: Money;
    type: TransactionType;
    description?: string;
  }): ValidationResult {
    const allErrors: string[] = [];

    const merchantValidation = this.validateMerchantId(data.merchantId);
    allErrors.push(...merchantValidation.errors);

    const amountValidation = this.validateAmount(data.amount);
    allErrors.push(...amountValidation.errors);

    const currencyValidation = this.validateCurrency(data.amount.currency);
    allErrors.push(...currencyValidation.errors);

    const typeValidation = this.validateTransactionType(data.type);
    allErrors.push(...typeValidation.errors);

    if (data.description) {
      const descriptionValidation = this.validateDescription(data.description);
      allErrors.push(...descriptionValidation.errors);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  /**
   * Validate cancellation
   */
  validateCancellation(reason: string): ValidationResult {
    const errors: string[] = [];

    if (!reason || reason.trim().length === 0) {
      errors.push('Cancellation reason is required');
    }

    if (reason && reason.length < 10) {
      errors.push('Cancellation reason must be at least 10 characters');
    }

    if (reason && reason.length > 500) {
      errors.push('Cancellation reason cannot exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if amount is suspicious (potential fraud)
   */
  isSuspiciousAmount(amount: Money): boolean {
    // Flag transactions over 50k as suspicious
    return amount.value > 50000;
  }

  /**
   * Check if transaction frequency is suspicious
   */
  isSuspiciousFrequency(transactionCount: number, timeWindowMinutes: number): boolean {
    // More than 10 transactions in 5 minutes is suspicious
    if (timeWindowMinutes <= 5 && transactionCount > 10) {
      return true;
    }

    // More than 50 transactions in 1 hour is suspicious
    if (timeWindowMinutes <= 60 && transactionCount > 50) {
      return true;
    }

    return false;
  }
}

// Made with Bob
