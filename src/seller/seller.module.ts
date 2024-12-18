// seller.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seller } from './entities/seller.entity';
import { User } from 'src/users/user.entity';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { Vebxrmodel } from 'src/vebxrmodel/entities/vebxrmodel.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { ReviewRequest } from 'src/review_request/entities/review_request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seller, User, Vebxrmodel, Payment, ReviewRequest])],  // Import both Seller and User entities
  providers: [SellerService],
  controllers: [SellerController],
})
export class SellerModule {}
