import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { ConfigModule } from '@nestjs/config';
import { AdminController } from './admin/admin.controller';
import { ModeratorManageModule } from './moderator-manage/moderator-manage.module';
import { ItemModule } from './vebxrmodel/item.module';
import { Item } from './vebxrmodel/entities/item.entity';
import { CategoryModule } from './category/category.module';
import { CategoryService } from './category/category.service';
import { Category } from './category/category.entity';
import { CartModule } from './cart/cart.module';
import { Cart } from './cart/entities/cart.entity';
import { Payment } from './payment/entities/payment.entity';
import { SellerModule } from './seller/seller.module';
import { StatisticsModule } from './statistics/statistics.module';
import { PaymentModule } from './payment/payment.module';
import { Seller } from './seller/entities/seller.entity';
import { TransactionsModule } from './transaction/transaction.module';
import { Transaction } from './transaction/entities/transaction.entity';
import { ModelModule } from './model/model.module';
import { ModelEntity } from './model/entities/model.entity';
import { AidescribeModule } from './aidescribe/aidescribe.module';
import { UserlikesModule } from './userlikes/userlikes.module';
import { UserLikes } from './userlikes/entities/userlike.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'stylesphere',
      entities: [User, Item, Category, Payment, Cart, Seller, Transaction, ModelEntity, UserLikes],
      synchronize: true,
    }),
    AuthModule,
    ConfigModule.forRoot(),
    ModeratorManageModule,
    ItemModule,
    CategoryModule,
    CartModule,
    StatisticsModule,
    PaymentModule,
    SellerModule,
    TransactionsModule,
    ModelModule,
    AidescribeModule,
    UserlikesModule
  ],
  
  providers: [

  ],
  
  controllers: [ AdminController],
})
export class AppModule implements OnModuleInit{
  constructor(private categoryService: CategoryService) {}

  async onModuleInit() {
    await this.categoryService.seedCategories();
  }
}
