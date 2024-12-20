// seller.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seller } from './entities/seller.entity';
import { User } from 'src/users/user.entity';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { Item } from 'src/vebxrmodel/entities/item.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seller, User, Item, Payment])],  // Import both Seller and User entities
  providers: [SellerService],
  controllers: [SellerController],
})
export class SellerModule {}
