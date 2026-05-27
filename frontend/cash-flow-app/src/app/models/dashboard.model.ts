import { DailyBalance, BalanceSummary } from './balance.model';

export interface DashboardData {
  currentBalance: number;
  totalCredits: number;
  totalDebits: number;
  transactionCount: number;
  balanceHistory: DailyBalance[];
  summary: BalanceSummary;
}

export interface DashboardMetrics {
  balance: number;
  credits: number;
  debits: number;
  transactionCount: number;
}

// Made with Bob
