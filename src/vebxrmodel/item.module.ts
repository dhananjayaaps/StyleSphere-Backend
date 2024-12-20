import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Category } from 'src/category/category.entity';
import { Seller } from 'src/seller/entities/seller.entity';
import { ModelEntity } from 'src/model/entities/model.entity';
import { UserLikes } from 'src/userlikes/entities/userlike.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, Category, Seller, ModelEntity, UserLikes, Payment]),
  ],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
