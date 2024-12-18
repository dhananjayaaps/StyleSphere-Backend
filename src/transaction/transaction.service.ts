import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller } from '../seller/entities/seller.entity';
import { Transaction, TransactionStatus } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  // Find seller by userId
  async findSellerByUserId(userId: number): Promise<Seller | null> {
    return this.sellerRepository.findOne({ where: { user: { id: userId } } });
  }

  // Withdraw money
  async withdrawMoney(sellerId: number, amount: number) {
    const seller = await this.sellerRepository.findOne({ where: { id: sellerId } });

    if (!seller) {
      throw new NotFoundException('Seller account not found');
    }

    if (seller.accountBalance < amount) {
      throw new NotFoundException('Insufficient balance');
    }

    seller.accountBalance -= amount;

    const transaction = this.transactionRepository.create({
      seller: { id: seller.id } as any,
      amount,
      status: TransactionStatus.PENDING,
    });

    await this.sellerRepository.save(seller);
    return this.transactionRepository.save(transaction);
  }

  // Get seller's transactions
  async getTransactionsBySeller(sellerId: number) {
    return this.transactionRepository.find({
      where: { seller: { id: sellerId } },
      relations: ['seller'],
    });
  }

  // Get all transactions
  async getAllTransactions() {
    return this.transactionRepository.find({ relations: ['seller'] });
  }

  // Update transaction status
  async updateTransactionStatus(
    transactionId: number,
    stripeTransactionId?: string,
  ) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (stripeTransactionId) {
      transaction.stripeTransactionId = stripeTransactionId;
    }

    return this.transactionRepository.save(transaction);
  }

  // Get sellers transactions
  async getWithdrawalDetails(userId: number) {
    // Fetch seller details (balance, etc.)


    const seller = await this.sellerRepository.findOne({
      where: { user: { id: userId } },
    });


    if (!seller) {
      throw new NotFoundException('Seller account not found');
    }

    // Fetch pending withdrawals (transactions with PENDING status)
    const pendingWithdrawals = await this.transactionRepository.find({
      where: { seller: { id: seller.id }, status: TransactionStatus.PENDING },
    });

    // Calculate pending withdrawal amount
    const pendingAmount = pendingWithdrawals.reduce((total, transaction) => total + transaction.amount, 0);

    // Fetch total withdrawals (transactions with COMPLETED status)
    const completedWithdrawals = await this.transactionRepository.find({
      where: { seller: { id: seller.id }},
    });

    // Calculate total withdrawal amount
    const totalWithdrawals = completedWithdrawals.reduce((total, transaction) => total + transaction.amount, 0);

    return {
      balance: seller.accountBalance,
      pendingWithdrawals: pendingAmount,
      totalWithdrawals: totalWithdrawals,
      pastWithdrawals: completedWithdrawals,
    };
  }

}
