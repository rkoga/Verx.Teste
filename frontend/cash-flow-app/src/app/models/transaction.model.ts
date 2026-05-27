export interface Transaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  date: string;
  description: string;
  categoryId?: string;
  status: 'ACTIVE' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface CreateTransactionDto {
  idempotencyKey: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  date: string;
  description: string;
  categoryId?: string;
}

export interface CancelTransactionDto {
  reason: string;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: 'CREDIT' | 'DEBIT';
  page?: number;
  limit?: number;
}

// Made with Bob
