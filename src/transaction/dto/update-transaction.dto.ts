import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTransactionStatusDto {
  @IsNotEmpty()
  transactionId: number; // Ensure this is present and validated

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  stripeTransactionId?: string;
}
