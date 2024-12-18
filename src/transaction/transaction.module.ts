import { Module, forwardRef } from '@nestjs/common';
import { TransactionsService } from './transaction.service';
import { TransactionsController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { SellerModule } from 'src/seller/seller.module'; // Import SellerModule
import { Seller } from 'src/seller/entities/seller.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Seller]), // Register Transaction and Seller entities
    forwardRef(() => SellerModule), // Use forwardRef to avoid circular dependency
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController],
  exports: [TransactionsService], // Export service if used by other modules
})
export class TransactionsModule {}
