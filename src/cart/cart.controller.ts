import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, InternalServerErrorException } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCartDto: CreateCartDto, @Req() req) {
    return this.cartService.addToCart(req.user.userId, createCartDto.modelId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':modelId')
  async removeFromCart(@Param('modelId') modelId: number, @Req() req) {
    try {
      const deletedModel = await this.cartService.removeFromCart(req.user.userId, modelId);

      // Return 200 response with a success message
      return { message: 'Deleted successfully', data: deletedModel };
    } catch (err) {
      console.error(err);

      // Return a 500 Internal Server Error with a meaningful error message
      throw new InternalServerErrorException('Failed to delete the model from the cart');
    }
  }


  @UseGuards(JwtAuthGuard)
  @Get()
  async getCart(@Req() req) {
    const userId = req.user.userId;

    return this.cartService.getCart(userId);
  }

  
}
