import { IsNumber, IsOptional, IsEnum } from 'class-validator';
import { TransactionStatus } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}