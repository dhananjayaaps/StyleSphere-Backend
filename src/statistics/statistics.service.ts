import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Transaction } from 'typeorm';
import { Item } from 'src/vebxrmodel/entities/item.entity';
import { Category } from 'src/category/category.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { User } from 'src/users/user.entity';
import { Seller } from 'src/seller/entities/seller.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Item)
    private readonly vebxrmodelRepository: Repository<Item>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Seller) 
    private readonly sellerRepository: Repository<Seller>,

    // @Inject(forwardRef(() => Transaction))
    // @InjectRepository(Transaction)
    // private readonly transactionRepository: Repository<Transaction>,
  ) {}

  // Get date range for the last month
  private getLastMonthRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startOfMonth, endOfMonth };
  }

  // Get date range for the last week
  private getLastWeekRange() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7); // 7 days ago
    return { startOfWeek, endOfWeek: now };
  }

  // Get category-wise revenue for the last month
  private async getCategoryRevenueLastMonth() {
    const { startOfMonth, endOfMonth } = this.getLastMonthRange();

    const results = await this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.model', 'model')
      .innerJoin('model.category', 'category')
      .select('category.name', 'categoryName')
      .addSelect('SUM(payment.amount)', 'totalRevenue')
      .where('payment.purchasedAt BETWEEN :startOfMonth AND :endOfMonth', {
        startOfMonth,
        endOfMonth,
      })
      .groupBy('category.name')
      .getRawMany();

    return results;
  }

  // Get day-wise revenue for the last week
  private async getCategoryRevenueLastWeek() {
    const { startOfWeek, endOfWeek } = this.getLastWeekRange();

    const results = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('DATE(payment.purchasedAt)', 'date')
      .addSelect('SUM(payment.amount)', 'totalRevenue')
      .where('payment.purchasedAt BETWEEN :startOfWeek AND :endOfWeek', {
        startOfWeek,
        endOfWeek,
      })
      .groupBy('DATE(payment.purchasedAt)')
      .orderBy('DATE(payment.purchasedAt)', 'ASC')
      .getRawMany();

    const dailySales = results.map(({ date, totalRevenue }) => ({
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      value: parseFloat(totalRevenue),
    }));

    return dailySales;
  }

  // Calculate statistics and improvements
  async getStatistics() {
    // All-time statistics
    const totalModels = await this.vebxrmodelRepository.count();
    const totalUsers = await this.userRepository.count();

    const totalRevenue = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'totalRevenue')
      .getRawOne();

    const totalPurchases = await this.paymentRepository.count();

    const totalLikes = await this.vebxrmodelRepository
      .createQueryBuilder('model')
      .select('SUM(model.likesCount)', 'totalLikes')
      .getRawOne();

    const totalDownloads = await this.vebxrmodelRepository
      .createQueryBuilder('model')
      .select('SUM(model.downloads)', 'totalDownloads')
      .getRawOne();

    const mostPopularModel = await this.vebxrmodelRepository
      .createQueryBuilder('model')
      .orderBy('model.downloads', 'DESC')
      .addOrderBy('model.likesCount', 'DESC')
      .getOne();

    // Last week's statistics
    const { startOfWeek, endOfWeek } = this.getLastWeekRange();

    const newModelsLastWeek = await this.vebxrmodelRepository
      .createQueryBuilder('model')
      .where('model.createdAt BETWEEN :startOfWeek AND :endOfWeek', {
        startOfWeek,
        endOfWeek,
      })
      .getCount();

    const newUsersLastWeek2 = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt BETWEEN :startOfWeek AND :endOfWeek', {
        startOfWeek,
        endOfWeek,
      })

    const moderatorsCount = await this.userRepository
      .createQueryBuilder('user')
      .where('user.roles LIKE :role', { role: `%moderator%` })
      .getCount();

    const sellersCount = await this.sellerRepository
      .createQueryBuilder('seller')
      .getCount();

    // last week new sellers
    const newSellersLastWeek = await this.sellerRepository
      .createQueryBuilder('seller')
      .where('seller.createdAt BETWEEN :startOfWeek AND :endOfWeek', {
        startOfWeek,
        endOfWeek,
      })
      .getCount();

      const sellerImprovement = ((newSellersLastWeek / (sellersCount || 1)) * 100).toFixed(2);

    const totalCategories = await this.categoryRepository.count();

    //total buyers get from payment table
    const totalBuyers = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COUNT(DISTINCT payment.userId)', 'totalBuyers')
      .getRawOne();

    //total buyers last week
    const newBuyersLastWeek = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COUNT(DISTINCT payment.userId)', 'newBuyersLastWeek')
      .where('payment.purchasedAt BETWEEN :startOfWeek AND :endOfWeek', {
        startOfWeek,
        endOfWeek,
      })
      .getRawOne();

    //total buyers improvement
    const buyersImprovement = ((newBuyersLastWeek.newBuyersLastWeek / (totalBuyers.totalBuyers || 1)) * 100).toFixed(2);

    // :todo: Fix this

    const newUsersLastWeek = 2;

    const lastWeekRevenueData = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'lastWeekRevenue')
      .where('payment.purchasedAt BETWEEN :startOfWeek AND :endOfWeek', {
        startOfWeek,
        endOfWeek,
      })
      .getRawOne();
    const lastWeekRevenue = parseFloat(lastWeekRevenueData.lastWeekRevenue || 0);

    // Improvement calculations
    const modelsImprovement = ((newModelsLastWeek / (totalModels || 1)) * 100).toFixed(2);
    const usersImprovement = ((newUsersLastWeek / (totalUsers || 1)) * 100).toFixed(2);
    const revenueImprovement = ((lastWeekRevenue / (totalRevenue.totalRevenue || 1)) * 100).toFixed(2);

    // Fetch revenue details
    const lastMonthRevenue = await this.getCategoryRevenueLastMonth();
    const lastWeekCategoryRevenue = await this.getCategoryRevenueLastWeek();

    return {
      totalModels,
      totalUsers,
      totalRevenue: totalRevenue.totalRevenue || 0,
      totalPurchases,
      totalLikes: totalLikes.totalLikes || 0,
      totalDownloads: totalDownloads.totalDownloads || 0,
      mostPopularModel,
      lastMonthRevenue,
      lastWeekRevenue: lastWeekCategoryRevenue,
      newModelsLastWeek,
      newUsersLastWeek,
      moderatorsCount,
      sellersCount,
      totalCategories,
      totalBuyers: totalBuyers.totalBuyers || 0,
      improvement: {
        models: `${modelsImprovement}%`,
        users: `${usersImprovement}%`,
        revenue: `${revenueImprovement}%`,
        sellers: `${sellerImprovement}%`,
        buyers: `${buyersImprovement}%`,
      }
    };
  }

  async getRevenueData(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Total revenue: total payments * 20% (platform's revenue)
    const totalPayments = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.purchasedAt BETWEEN :start AND :end', { start, end })
      .andWhere('payment.status = :status', { status: 'success' })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();
    const totalRevenue = (totalPayments?.total || 0) * 0.2;

    // Total sales: count of unique sellers who made sales
    const totalSales = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.purchasedAt BETWEEN :start AND :end', { start, end })
      .select('COUNT(payment.id)', 'count')
      .getRawOne();
    

    // Total payouts: total count of transactions
    // const totalPayouts = await this.transactionRepository
    //   .createQueryBuilder('transaction')
    //   .where('transaction.createdAt BETWEEN :start AND :end', { start, end })
    //   .getCount();

    // Total refunds: sum of refunded payment amounts
    const totalRefunds = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.purchasedAt BETWEEN :start AND :end', { start, end })
      .andWhere('payment.status = :status', { status: 'refund' })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();

    // Average revenue: total of all payments * 80% / total sellers
    const totalRevenueForSellers = (totalPayments?.total || 0) * 0.8;
    const totalSellers = await this.sellerRepository.count();
    const averageRevenue = totalSellers > 0 ? totalRevenueForSellers / totalSellers : 0;

// most selling category
    // const mostSellingCategory = await this.paymentRepository
    // .createQueryBuilder('payment')
    // .innerJoin('payment.model', 'model') // Join with Vebxrmodel
    // .innerJoin('model.category', 'category') // Join with Category
    // .select('category.id', 'categoryId') // Select Category ID
    // .addSelect('category.name', 'categoryName') // Select Category Name
    // .addSelect('COUNT(payment.id)', 'salesCount') // Count sales for each category
    // .groupBy('category.id') // Group by category
    // .orderBy('salesCount', 'DESC') // Order by sales count (descending)
    // .limit(1) // Limit to the most selling category
    // .getRawOne();


    // Monthly revenue growth: (last month revenue / total revenue - last month revenue) * 100%
    const today = new Date(); // Current date
    const last30DaysStart = new Date(today); // Clone today's date
    last30DaysStart.setDate(today.getDate() - 30);
    today.setDate(today.getDate() + 1);

    // Setting time explicitly for precision
    last30DaysStart.setHours(0, 0, 0, 0); // Start of the day 30 days ago
    today.setHours(23, 59, 59, 999); // End of today

    const last30DaysPayments = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.purchasedAt BETWEEN :start AND :end', {
        start: last30DaysStart,
        end: today,
      })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();

    const totPayments = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .getRawOne();


    const lastMonthRevenue = (last30DaysPayments?.total || 0);
    const finaltotalpayments = (totPayments?.total || 0);
    const monthlyRevenueGrowth =
    finaltotalpayments > 0
        ? (lastMonthRevenue / (finaltotalpayments - lastMonthRevenue)) * 100
        : 0;

    return {
      totalRevenue,
      totalSales: totalSales?.count || 0,
      // mostSellingCategory: mostSellingCategory.categoryName,
      mostSellingCategory: "Character",
      totalRefunds: totalRefunds?.total || 0,
      averageRevenue,
      monthlyRevenueGrowth,
    };
  }
}
