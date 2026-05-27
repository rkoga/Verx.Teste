import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelTransactionDto {
  @ApiProperty({
    description: 'Reason for cancellation',
    example: 'Customer requested cancellation',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  reason: string;
}

// Made with Bob