import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity'; // Adjust path to Cart entity
import { User } from 'src/users/user.entity'; // Adjust path to User entity
import { Vebxrmodel } from 'src/vebxrmodel/entities/vebxrmodel.entity'; // Adjust path to Vebxrmodel entity

@Module({
  imports: [TypeOrmModule.forFeature([Cart, User, Vebxrmodel])],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
