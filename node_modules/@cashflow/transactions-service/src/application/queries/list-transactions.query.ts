export class ListTransactionsQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly type?: 'CREDIT' | 'DEBIT',
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}

// Made with Bob