export class CreateTransactionCommand {
  constructor(
    public readonly amount: number,
    public readonly type: 'CREDIT' | 'DEBIT',
    public readonly date: Date,
    public readonly description: string,
    public readonly categoryId: string | null,
    public readonly idempotencyKey: string,
  ) {}
}

// Made with Bob