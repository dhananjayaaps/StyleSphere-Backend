import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity'; // Adjust path to Cart entity
import { User } from 'src/users/user.entity'; // Adjust path to User entity
import { Item } from 'src/vebxrmodel/entities/item.entity'; // Adjust path to Vebxrmodel entity

@Module({
  imports: [TypeOrmModule.forFeature([Cart, User, Item])],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
