import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ConsolidationService, TransactionData } from '../../../application/services/consolidation.service';
import { BalanceResponseDto } from '../dtos/balance-response.dto';

@ApiTags('consolidation')
@Controller('consolidation')
@ApiBearerAuth()
export class ConsolidationController {
  constructor(
    private readonly consolidationService: ConsolidationService,
  ) {}

  @Get('balance/:date')
  @ApiOperation({ summary: 'Get daily balance for a specific date' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format', example: '2026-05-26' })
  @ApiResponse({
    status: 200,
    description: 'Balance retrieved successfully',
    type: BalanceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Balance not found' })
  async getBalance(
    @Param('date') dateStr: string,
  ): Promise<BalanceResponseDto> {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const balance = await this.consolidationService.getBalance(date);

    if (!balance) {
      throw new NotFoundException(`Balance not found for ${dateStr}`);
    }

    return BalanceResponseDto.fromEntity(balance);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get balance history' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Balance history retrieved successfully',
    type: [BalanceResponseDto],
  })
  async getBalanceHistory(
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ): Promise<BalanceResponseDto[]> {
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    startDate.setDate(startDate.getDate() - 30); // Default: last 30 days
    startDate.setHours(0, 0, 0, 0);

    const endDate = endDateStr ? new Date(endDateStr) : new Date();
    endDate.setHours(0, 0, 0, 0);

    const balances = await this.consolidationService.getBalanceHistory(
      startDate,
      endDate,
    );

    return balances.map(BalanceResponseDto.fromEntity);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get balance summary' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Summary retrieved successfully',
  })
  async getSummary(
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    const endDate = endDateStr ? new Date(endDateStr) : new Date();
    endDate.setHours(0, 0, 0, 0);

    const balances = await this.consolidationService.getBalanceHistory(
      startDate,
      endDate,
    );

    if (balances.length === 0) {
      return {
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
        totalCredits: 0,
        totalDebits: 0,
        netChange: 0,
        daysCount: 0,
      };
    }

    const totalCredits = balances.reduce((sum, b) => sum + b.totalCredits.value, 0);
    const totalDebits = balances.reduce((sum, b) => sum + b.totalDebits.value, 0);
    const netChange = totalCredits - totalDebits;

    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      totalCredits,
      totalDebits,
      netChange,
      daysCount: balances.length,
      openingBalance: balances[balances.length - 1].openingBalance.value,
      closingBalance: balances[0].closingBalance.value,
    };
  }

  @Post('trigger/:date')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger consolidation for a specific date' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format', example: '2026-05-27' })
  @ApiBody({
    description: 'Transactions to consolidate',
    schema: {
      type: 'object',
      properties: {
        transactions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              amount: { type: 'number', example: 100.50 },
              type: { type: 'string', enum: ['CREDIT', 'DEBIT'], example: 'CREDIT' },
              date: { type: 'string', format: 'date', example: '2026-05-27' },
            },
            required: ['amount', 'type', 'date'],
          },
        },
      },
      required: ['transactions'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Consolidation triggered successfully',
    type: BalanceResponseDto,
  })
  async triggerConsolidation(
    @Param('date') dateStr: string,
    @Body() body: { transactions: TransactionData[] },
  ): Promise<BalanceResponseDto> {
    // Parse date in local timezone to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0, 0); // Use noon to avoid timezone issues

    const balance = await this.consolidationService.consolidateDay(
      date,
      body.transactions,
    );

    return BalanceResponseDto.fromEntity(balance);
  }
}

// Made with Bob