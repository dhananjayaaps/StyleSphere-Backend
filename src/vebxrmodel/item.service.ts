import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { Seller } from 'src/seller/entities/seller.entity';
import { Category } from 'src/category/category.entity';
import { ModelEntity } from 'src/model/entities/model.entity';
import { UserLikes } from 'src/userlikes/entities/userlike.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Injectable()
export class ItemService {
  
  constructor(
    @InjectRepository(Item)
    private readonly VebxrmodelRepository: Repository<Item>,

    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(ModelEntity)
    private readonly modelRepository: Repository<ModelEntity>,

    @InjectRepository(UserLikes)
    private readonly userLikesRepository: Repository<UserLikes>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

  ) {}
  

  async create(createVebxrmodelDto: CreateItemDto, userId: number): Promise<Item> {
    const category = await this.categoryRepository.findOne({
      where: { id: createVebxrmodelDto.category },
    });

    if (!category) {
      throw new Error('Category not found');
    }
  
    const seller = await this.sellerRepository.findOne({ where: { user: { id: userId } } });
    if (!seller) {
      throw new Error('Seller not found');
    }
  
    const savedvebxrmodel = await this.VebxrmodelRepository.save({
      ...createVebxrmodelDto,
      category,
      modelOwner: seller,
    });

    return savedvebxrmodel;
  }
  

  findAll(): Promise<Item[]> {
    return this.VebxrmodelRepository.find();
  }

  findOne(id: number): Promise<Item> {
    return this.VebxrmodelRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.VebxrmodelRepository.delete(id);
  }

  async findWithFilters(
    filters: {
      category?: number;
      minPrice?: number;
      maxPrice?: number;
      format?: string;
      license?: string;
    },
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ data: Item[]; total: number }> {
    const query = this.VebxrmodelRepository.createQueryBuilder('model');

    if (filters.category !== undefined && !isNaN(filters.category)) {
      query.andWhere('model.category = :category', { category: filters.category });
    }
    if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
      query.andWhere('model.price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      query.andWhere('model.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }
    if (filters.format) {
      query.andWhere('model.format = :format', { format: filters.format });
    }
    if (filters.license) {
      query.andWhere('model.license = :license', { license: filters.license });
    }

    const [data, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { data, total };
  }

  async findWithFiltersandLikes(
    filters: {
      category?: number;
      minPrice?: number;
      maxPrice?: number;
      format?: string;
      license?: string;
      keyword?: string;  // Added keyword to the filter type
    },
    userId: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ data: (Item & { isUserLiked: boolean })[]; total: number }> {
    const query = this.VebxrmodelRepository.createQueryBuilder('model');
  
    // Filter by category if provided
    if (filters.category !== undefined && !isNaN(filters.category)) {
      query.andWhere('model.category = :category', { category: filters.category });
    }
  
    // Filter by minimum price if provided
    if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
      query.andWhere('model.price >= :minPrice', { minPrice: filters.minPrice });
    }
  
    // Filter by maximum price if provided
    if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      query.andWhere('model.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }
  
    // Filter by format if provided
    if (filters.format) {
      query.andWhere('model.format = :format', { format: filters.format });
    }
  
    // Filter by license if provided
    if (filters.license) {
      query.andWhere('model.license = :license', { license: filters.license });
    }
  
    // Filter by keyword in the model title if provided
    if (filters.keyword) {
      query.andWhere('model.title ILIKE :keyword', {  // Use ILIKE for case-insensitive search in PostgreSQL
        keyword: `%${filters.keyword}%`,  // Ensures wildcard is correctly added
      });
    }
  
    // Fetch paginated models
    const [models, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  
    // Fetch likes for the user and models
    const likedModelIds = await this.userLikesRepository
      .createQueryBuilder('like')
      .select('like.model.id')
      .where('like.user.id = :userId', { userId })
      .andWhere('like.model.id IN (:...modelIds)', { modelIds: models.map((m) => m.id) })
      .getRawMany();
  
    const likedModelIdSet = new Set(likedModelIds.map((like) => like.like_modelId));
  
    // Add `isUserLiked` flag to each model
    const data = models.map((model) => ({
      ...model,
      isUserLiked: likedModelIdSet.has(model.id),
    }));
  
    return { data, total };
  }  
  

  async getFormattedModels() {
    const models = await this.VebxrmodelRepository.find({
      relations: ['modelOwner' , 'category'],
    });
  
    return models.map((model) => ({
      id: model.id,
      name: model.title,
      user: {
        name: model.modelOwner.displayName,
        image: model.modelOwner.profilePicture || 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
      },
      image: model.image1Url,
      category: model.category.name,
      price: model.price,
      reviews: model.review
    }));
  }

  async findSellerModels(sellerId: number): Promise<Item[]> {
    return this.VebxrmodelRepository.find({
      where: { modelOwner: { id: sellerId } },
    });
  }
  
  async askFromAI(question: string, modelId: number) {

    const model = await this.VebxrmodelRepository.findOne({ where: { id: modelId }, relations: ['model'] });
    if (!model) {
      throw new Error('Model not found');
    }
    console.log('Model:', model);

    const jsonOfModel = JSON.stringify(model);
    console.log('Model:', jsonOfModel);

    const response = await fetch('http://127.0.0.1:5000/ask_ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        model: jsonOfModel,
        question 
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    throw new Error('AI model error');
  }

  async findModel(id: number, userId: number): Promise<any> {
    // Fetch the model data
    const model = await this.VebxrmodelRepository.findOne({ 
      where: { id }, 
      relations: ['modelOwner', 'category'] 
    });
  
    if (!model) {
      throw new Error('Model not found');
    }
  
    // Check if the model is bought by the user
    const BoughtData = await this.paymentRepository.findOne({
      where: { model: { id }, user: { id: userId } },
    });

    const isBought = !!BoughtData;
  
    // Check if the model is liked by the user
    const LikedData = await this.userLikesRepository.findOne({
      where: { model: { id }, user: { id: userId } },
    });

    const isLiked = !!LikedData;
  
    // Fetch reviews for the model
    const reviews = await this.paymentRepository.find({
      where: { model: { id }, reviewMessage: Not(IsNull()) },
    });
  
    // Check if the user has reviewed the model
    const reviewedData = await this.paymentRepository.findOne({
      where: { model: { id }, user: { id: userId }, reviewMessage: Not(IsNull()) },
    });

    const amIreviewed = !!reviewedData;
  
    return {
      model,
      isBought,
      isLiked,
      reviews,
      amIreviewed,
    };
  }
  
  async searchWithAI(query: string): Promise<any[]> {
    try {
      
      // Send the query to the AI search service
      const response = await fetch('http://127.0.0.1:5000/get_results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch AI search results');
      }
  
      // Parse the JSON response
      const searchResults = await response.json();
  
      // Replace the modelID with the actual model details
      const enrichedResults = await Promise.all(
        searchResults.map(async (result) => {
          const model = await this.VebxrmodelRepository.findOne({
            where: { id: result.modelID },
          });
  
          if (model) {
            return {
              ...result,
              model,
            };
          }
  
          return result;
        })
      );
  
      return enrichedResults;
    } catch (error) {
      throw new HttpException('AI search service error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }    
  
}
