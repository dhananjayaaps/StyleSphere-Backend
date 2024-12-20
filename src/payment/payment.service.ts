// payment.service.ts
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Item } from 'src/vebxrmodel/entities/item.entity';
import { StripeService } from 'src/stripe/stripe.service';
import { GetTransactionsDto } from './dto/transactions.dto';
import { Seller } from 'src/seller/entities/seller.entity';
import { Cart } from 'src/cart/entities/cart.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Item)
    private modelRepository: Repository<Item>,
    private stripeService: StripeService,
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async purchaseItems(userId: number, modelIds: number[], paymentMethodId: string) {
    const stripe = this.stripeService.getClient();
    const purchases = [];
    let totalAmount = 0;
    const buying_models = [];

    for (const modelId of modelIds) {
      const model = await this.modelRepository.findOne({ where: { id: modelId } });
      buying_models.push(model);

      // remove from cart
      const existingCartItem = await this.cartRepository.findOne({
        where: {  user: { id: userId }, model: { id: modelId } },
      });

      if (existingCartItem) {
        await this.cartRepository.remove(existingCartItem);
      }

      if (!model) {
        throw new Error(`Model with ID ${modelId} not found.`);
      }

      totalAmount += model.price * 100; // Convert to cents
    }

    for (const model of buying_models) {
      const payment = this.paymentRepository.create({
        user: { id: userId },
        model: { id: model.id },
        amount: model.price,
        status: 'pending',
      });

      purchases.push(await this.paymentRepository.save(payment));
    }

    // increse seller balance
    for (const modelId of modelIds) {
      const model = await this.modelRepository.findOne({ where: { id: modelId }, relations: ['modelOwner'] });

      // find seller and update balance
      const seller = await this.sellerRepository.findOne({ where: { id: model.modelOwner.id } });
      seller.accountBalance = seller.accountBalance + model.price * 0.8;
      seller.totalEarnings = seller.totalEarnings + model.price * 0.8;

      // console.log('model.modelOwner.accountBalance', model.modelOwner.accountBalance);
      await this.modelRepository.save(model);
    }

    // return totalAmount and purchases or null;
    return totalAmount;
  }

  async getPurchasedItems(userId: number) {
    return this.paymentRepository.find({ where: { user: { id: userId } } });
  }

  async addReview(userId: number, modelId: number, reviewMessage: string, reviewStars: number) {
    const purchase = await this.paymentRepository.findOne({
      where: { user: { id: userId }, model: { id: modelId } },
    });

    console.log('reviewMessage', reviewMessage);
    console.log('reviewStars', reviewStars);

    if (!purchase) {
      throw new Error('Purchase not found or user does not own this item.');
    }

    // check already reviewved or not
    if (purchase.reviewMessage || purchase.reviewStars) {
      throw new Error('You have already reviewed this item.');
    }

    // update total review value in the vebxrmodel table
    const model = await this.modelRepository.findOne({ where: { id: modelId } });
    model.review = (model.review * model.totalReviews + reviewStars) / (model.totalReviews + 1);
    model.totalReviews = model.totalReviews + 1;
    await this.modelRepository.save(model);

    purchase.reviewMessage = reviewMessage;
    purchase.reviewStars = reviewStars;

    return this.paymentRepository.save(purchase);
  }

  async getTransactions(filters: GetTransactionsDto) {
    const { creatorName, modelName, startDate, endDate } = filters;
  
    const query = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user') // Join user data
      .leftJoinAndSelect('payment.model', 'model') // Join model data
      .leftJoinAndSelect('model.modelOwner', 'modelOwner'); // Join model owner data
  
    // Apply filters
    if (creatorName) {
      query.andWhere('modelOwner.displayName ILIKE :creatorName', {
        creatorName: `%${creatorName}%`,
      });
    }
  
    if (modelName) {
      query.andWhere('model.title ILIKE :modelName', { modelName: `%${modelName}%` });
    }
  
    if (startDate && endDate) {
      query.andWhere('payment.purchasedAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }
  
    // Fetch data
    const transactions = await query.getMany();
  
    console.log('transactions', transactions);
  
    // Map data to desired format
    return transactions.map((transaction) => ({
      id: transaction.id,
      creator: {
        name: transaction.model.modelOwner.displayName, // Get the display name of the model owner
        image: transaction.model.modelOwner.profilePicture || 'default-image-url', // Optional if profilePicture exists
      },
      invoice: transaction.id + 1000,
      customer: {
        name: `${transaction.user.firstName} ${transaction.user.lastName}`,
        // image: transaction.user.profilePicture || 'default-image-url',
      },
      amount: transaction.amount,
      status: transaction.status,
    }));
  }
  
}
