import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { User } from 'src/users/user.entity';
import { Item } from 'src/vebxrmodel/entities/item.entity';
import { GetCartDto } from './dto/get-cart.dto'; // Adjust path if necessary
import { Mode } from 'fs';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Item)
    private readonly vebxrmodelRepository: Repository<Item>,
  ) {}

  // Add a model to the cart for a specific user
  async addToCart(userId: number, modelId: number): Promise<Cart> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const model = await this.vebxrmodelRepository.findOne({ where: { id: modelId } });
    if (!model) {
      throw new NotFoundException('Model not found');
    }

    const existingCartItem = await this.cartRepository.findOne({
      where: {  user: { id: userId }, model: { id: modelId } },
    });

    console.log('existingCartItem', existingCartItem);

    if (existingCartItem) {
      throw new BadRequestException('This item is already in your cart');
    }

    const cartItem = this.cartRepository.create({ user, model });
    return this.cartRepository.save(cartItem);
  }

  // Get all cart items for a user and format the output using GetCartDto
  async getCart(userId: number): Promise<GetCartDto[]> {
    const cartItems = await this.cartRepository.find({
      where: { user: { id: userId } },
      relations: ['model', 'user'],
    });

    if (!cartItems.length) {
      throw new NotFoundException('No items in the cart for this user');
    }

    return cartItems.map((item) => ({
      modelId: item.model.id,
      title: item.model.title,
      price: item.model.price,
      userName: item.user.userName,
      imageUrl: item.model.image1Url,
      // description: item.model.description,
    }));
  }

  // Remove an item from the cart
  async removeFromCart(userId: number, modelId: number): Promise<void> {
    const cartItem = await this.cartRepository.findOne({
      where: { user: { id: userId }, model: { id: modelId } },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.remove(cartItem);
  }
}
