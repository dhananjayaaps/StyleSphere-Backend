// seller.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller } from './entities/seller.entity';
import { User, UserRole } from 'src/users/user.entity';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { Item } from 'src/vebxrmodel/entities/item.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { ModelEntity } from 'src/model/entities/model.entity';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Inject User repository

    @InjectRepository(Item)
    private readonly modelRepository: Repository<Item>, // Inject Model repository

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>, // Inject Payment repository
  ) {}

  // Create a new seller
  async create(createSellerDto: CreateSellerDto, userId: number): Promise<Seller> {
    // Ensure the user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Check if the user is already a seller
    const isSeller = await this.sellerRepository.findOne({ where: { user: { id: userId } } });
    if (isSeller) {
      throw new ConflictException('User is already a seller');
    }
  
    // Add the SELLER role to the user's roles
    if (!user.roles.includes(UserRole.SELLER)) {
      user.roles.push(UserRole.SELLER);
    }
  
    // Update the user entity with the new roles array
    await this.userRepository.save(user);
  
    // Create a new seller and associate it with the user
    const seller = this.sellerRepository.create({ ...createSellerDto, user });
  
    // Save the seller
    return this.sellerRepository.save(seller);
  }

  // Get all sellers
  async findAll(): Promise<Seller[]> {
    return await this.sellerRepository.find();
  }

  // Get seller by ID
  async findOne(id: number): Promise<Seller> {
    const seller = await this.sellerRepository.findOne({ where: { id }, relations: ['user'] });
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }
    return seller;
  }

  // Update seller details
  async update(updateSellerDto: UpdateSellerDto, userId): Promise<Seller> {

    // find seller by the user id
    const seller = await this.sellerRepository.findOne({ where: { user: { id: userId } } });

    Object.assign(seller, updateSellerDto);
    return this.sellerRepository.save(seller);
  }

  // Delete seller by ID
  async remove(id: number): Promise<void> {
    const seller = await this.findOne(id);
    await this.sellerRepository.remove(seller);
  }

  async getMySellerAccount(userId: number): Promise<Seller> {
    const seller = await this.sellerRepository.findOne({ where: { user: { id: userId } } });
    return seller;
  }

  // Get seller model details
  async getMyModels(userId: number) {
    const seller = await this.sellerRepository.findOne({ where: { user: { id: userId } }, relations: ['vebxrmodels'] });
    return seller.vebxrmodels;
  }

  async getSellerModelDetails(userId: number) {
    // Find the seller by user ID
    const seller = await this.sellerRepository.findOne({ 
      where: { user: { id: userId } },
      relations: ['vebxrmodels'],
    });
  
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }
  
    // console.log('seller', seller);
  
    // Calculate the total models
    const totalModels = seller.vebxrmodels.length;
  
    // Fetch all models of the seller to calculate additional metrics
    const sellerModels = await this.modelRepository.find({ where: { modelOwner: { id: seller.id } } });
  
    // Calculate the total likes
    const totalLikes = sellerModels.reduce((sum, model) => sum + model.likesCount, 0);
  
    // Calculate the total earnings from payments
    const totalEarnings = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.model', 'model')
      .where('model.modelOwner = :sellerId', { sellerId: seller.id })
      .select('SUM(payment.amount)', 'totalEarnings')
      .getRawOne()
      .then((result) => parseFloat(result.totalEarnings) || 0);

    const dailyEarnings = await this.paymentRepository
    .createQueryBuilder('payment')
    .leftJoin('payment.model', 'model')
    .where('model.modelOwner = :sellerId', { sellerId: seller.id })
    .andWhere('payment.purchasedAt >= :sevenDaysAgo', { sevenDaysAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) })
    .select(`DATE(payment.purchasedAt) AS date, SUM(payment.amount) AS dailyEarnings`)
    .groupBy('DATE(payment.purchasedAt)')
    .orderBy('DATE(payment.purchasedAt)', 'ASC')
    .getRawMany();

    // console.log('dailyEarnings', dailyEarnings);
    // Format the daily earnings for easier readability
    const formattedDailyEarningsDate = dailyEarnings.map((record) => ({
      date: record.date,
      earnings: parseFloat(record.dailyearnings),
    }));

    //make it with day name
    const formattedDailyEarnings = dailyEarnings.map((record) => ({
      date: record.date,
      earnings: parseFloat(record.dailyearnings),
      day: new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' }),
    }));
  
    // Calculate earnings for each model
    const modelEarningsAll = await Promise.all(
      sellerModels.map(async (model) => {
        const earnings = await this.paymentRepository
          .createQueryBuilder('payment')
          .where('payment.model = :modelId', { modelId: model.id })
          .select('SUM(payment.amount)', 'modelEarnings')
          .getRawOne()
          .then((result) => parseFloat(result.modelEarnings) || 0);
  
        return { modelId: model.id, modelName: model.title, earnings };
      }),
    );

    // remove models with zero earnings
    const modelEarnings = modelEarningsAll.filter((model) => model.earnings > 0);
  
    return {
      totalModels,
      totalLikes,
      totalEarnings,
      dailyEarnings : formattedDailyEarnings,
      modelEarnings,
    };
  }
  

}
