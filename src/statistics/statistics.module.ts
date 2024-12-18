import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Vebxrmodel } from 'src/vebxrmodel/entities/vebxrmodel.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { User } from 'src/users/user.entity';
import { Category } from 'src/category/category.entity';
import { Seller } from 'src/seller/entities/seller.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { TransactionsModule } from 'src/transaction/transaction.module'; // Import TransactionsModule
import { ReviewRequest } from 'src/review_request/entities/review_request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vebxrmodel, Payment, User, Category, Seller, Transaction, ReviewRequest]), // Register entities
    forwardRef(() => TransactionsModule), // Use forwardRef to resolve circular dependency
  ],
  providers: [StatisticsService],
  controllers: [StatisticsController],
  exports: [StatisticsService], // Export service for other modules
})
export class StatisticsModule {}
