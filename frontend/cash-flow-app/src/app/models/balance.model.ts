export interface DailyBalance {
  date: string;
  openingBalance: number;
  totalCredits: number;
  totalDebits: number;
  closingBalance: number;
  transactionCount: number;
}

export interface BalanceSummary {
  period: {
    startDate: string;
    endDate: string;
  };
  totalCredits: number;
  totalDebits: number;
  netChange: number;
  daysCount: number;
  openingBalance: number;
  closingBalance: number;
}

// Made with Bob
