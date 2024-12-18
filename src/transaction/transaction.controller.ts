import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Query,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; 
import { Request } from 'express';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Withdraw money
  @Post('withdraw')
  async withdraw(@Body('amount') amount: number, @Req() req) {
    const userId = req.user.userId;;

    // Fetch seller by userId
    const seller = await this.transactionsService.findSellerByUserId(userId);
    if (!seller) {
      throw new NotFoundException('Seller account not found');
    }

    return this.transactionsService.withdrawMoney(seller.id, amount);
  }

  // Get seller's transactions
  @Get('my-transactions')
  async getSellerTransactions(@Req() req) {
    const userId = req.user.userId;

    // Fetch seller by userId
    const seller = await this.transactionsService.findSellerByUserId(userId);
    if (!seller) {
      throw new NotFoundException('Seller account not found');
    }

    return this.transactionsService.getTransactionsBySeller(seller.id);
  }

  // Get all transactions (Admin only)
  @Get('all')
  async getAllTransactions() {
    return this.transactionsService.getAllTransactions();
  }

  @UseGuards(JwtAuthGuard)
  @Get('withdrawal-details')
  async getWithdrawalDetails(@Req() req) {
    const userId = req.user.userId;
    return this.transactionsService.getWithdrawalDetails(userId);
  }

  // Update transaction status
  @Patch('update')
  async updateTransactionStatus(
    @Body() updateTransactionStatusDto: UpdateTransactionStatusDto,
  ) {
    const { transactionId, status, stripeTransactionId } =
      updateTransactionStatusDto;

    return this.transactionsService.updateTransactionStatus(
      transactionId,
      stripeTransactionId,
    );
  }
}
