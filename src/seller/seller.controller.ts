// seller.controller.ts
import { Controller, Post, Get, Param, Body, Put, Delete, Req } from '@nestjs/common';
import { SellerService } from './seller.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { Seller } from './entities/seller.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserRole } from 'src/users/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('sellers')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  // Create a new seller
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createSellerDto: CreateSellerDto, @Req() req,): Promise<Seller> {
    const userId = req.user.userId;
    // console.log('userId', userId);
    return this.sellerService.create(createSellerDto, userId);
  }

  // Get all sellers
  @Get()
  async findAll(): Promise<Seller[]> {
    return this.sellerService.findAll();
  }

  @Roles(UserRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('myaccount')
  async getMySellerAccount(@Req() req): Promise<Seller> {
    const userId = req.user.userId;
    // console.log('userId', userId);
    return this.sellerService.getMySellerAccount(userId);
  }

  @Roles(UserRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('modelsDashboard')
  async getSellerModelDetails(@Req() req) {
    const userId = req.user.userId;
    return this.sellerService.getSellerModelDetails(userId);
  }

  @Roles(UserRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('mymodels')
  async getMyModels(@Req() req) {
    const userId = req.user.userId;
    return this.sellerService.getMyModels(userId);
  }

  // Update seller details
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @Put()
  async update(
    @Body() updateSellerDto: UpdateSellerDto,
    @Req() req,
  ): Promise<Seller> {
    const userId = req.user.userId;
    return this.sellerService.update(updateSellerDto, userId);
  }

  
  // Get seller by ID
  @Get(':id')
  async findOneById(@Param('id') id: number): Promise<Seller> {
    return this.sellerService.findOne(id);
  }

  // Delete seller by ID
  // @Delete(':id')
  // async remove(@Param('id') id: number): Promise<void> {
  //   return this.sellerService.remove(id);
  // }


  // Get seller's bank details
  // @Get(':id/bank-details')
  // async getSellerBankDetails(@Param('id') id: number): Promise<Partial<Seller>> {
  //   return this.sellerService.getSellerBankDetails(id);
  // }
}
