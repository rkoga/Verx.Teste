export class CancelTransactionCommand {
  constructor(
    public readonly transactionId: string,
    public readonly reason: string,
  ) {}
}

// Made with Bob