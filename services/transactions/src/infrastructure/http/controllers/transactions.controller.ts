import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { CancelTransactionDto } from '../dtos/cancel-transaction.dto';
import { ListTransactionsDto } from '../dtos/list-transactions.dto';
import {
  TransactionResponseDto,
  PaginatedTransactionResponseDto,
} from '../dtos/transaction-response.dto';
import { CreateTransactionCommand } from '../../../application/commands/create-transaction.command';
import { CancelTransactionCommand } from '../../../application/commands/cancel-transaction.command';
import { GetTransactionQuery } from '../../../application/queries/get-transaction.query';
import { ListTransactionsQuery } from '../../../application/queries/list-transactions.query';
import {
  CreateTransactionHandler,
  CancelTransactionHandler,
  GetTransactionHandler,
  ListTransactionsHandler,
} from '../../../application/handlers';

@ApiTags('transactions')
@Controller('transactions')
@ApiBearerAuth()
export class TransactionsController {
  constructor(
    private readonly createTransactionHandler: CreateTransactionHandler,
    private readonly cancelTransactionHandler: CancelTransactionHandler,
    private readonly getTransactionHandler: GetTransactionHandler,
    private readonly listTransactionsHandler: ListTransactionsHandler,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Duplicate transaction (idempotency key already exists)' })
  async createTransaction(
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const command = new CreateTransactionCommand(
      dto.amount,
      dto.type,
      new Date(dto.date),
      dto.description,
      dto.categoryId || null,
      dto.idempotencyKey,
    );

    const transaction = await this.createTransactionHandler.execute(command);
    return TransactionResponseDto.fromEntity(transaction);
  }

  @Get()
  @ApiOperation({ summary: 'List transactions with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: PaginatedTransactionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listTransactions(
    @Query() dto: ListTransactionsDto,
  ): Promise<PaginatedTransactionResponseDto> {
    const query = new ListTransactionsQuery(
      dto.startDate ? new Date(dto.startDate) : undefined,
      dto.endDate ? new Date(dto.endDate) : undefined,
      dto.type,
      dto.page || 1,
      dto.limit || 20,
    );

    const result = await this.listTransactionsHandler.execute(query);

    return {
      data: result.data.map(TransactionResponseDto.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Param('id') id: string): Promise<TransactionResponseDto> {
    const query = new GetTransactionQuery(id);
    const transaction = await this.getTransactionHandler.execute(query);
    return TransactionResponseDto.fromEntity(transaction);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction cancelled successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request (e.g., transaction cannot be cancelled)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async cancelTransaction(
    @Param('id') id: string,
    @Body() dto: CancelTransactionDto,
  ): Promise<TransactionResponseDto> {
    const command = new CancelTransactionCommand(id, dto.reason);
    const transaction = await this.cancelTransactionHandler.execute(command);
    return TransactionResponseDto.fromEntity(transaction);
  }
}

// Made with Bob