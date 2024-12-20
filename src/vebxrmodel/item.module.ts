import { Module } from '@nestjs/common';
import { VebxrmodelService } from './vebxrmodel.service';
import { VebxrmodelController } from './vebxrmodel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vebxrmodel } from './entities/vebxrmodel.entity';
import { Category } from 'src/category/category.entity';
import { CategoryModule } from 'src/category/category.module';
import { Seller } from 'src/seller/entities/seller.entity';
import { ReviewRequest } from 'src/review_request/entities/review_request.entity';
import { ModelEntity } from 'src/model/entities/model.entity';
import { UserLikes } from 'src/userlikes/entities/userlike.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vebxrmodel, Category, Seller, ReviewRequest, ModelEntity, UserLikes, Payment]),
  ],
  controllers: [VebxrmodelController],
  providers: [VebxrmodelService],
})
export class VebxrmodelModule {}
