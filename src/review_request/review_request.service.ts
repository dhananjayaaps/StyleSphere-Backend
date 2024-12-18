import { Injectable, NotFoundException, BadRequestException, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { ReviewRequest } from './entities/review_request.entity';
import { Seller } from 'src/seller/entities/seller.entity';
import { User } from 'src/users/user.entity';
import { ModelEntity } from 'src/model/entities/model.entity';
import { CreateReviewRequestDto } from './dto/create-review_request.dto';
import { Vebxrmodel } from 'src/vebxrmodel/entities/vebxrmodel.entity';

@Injectable()
export class ReviewRequestService {
  constructor(
    @InjectRepository(ReviewRequest)
    private readonly reviewRequestRepository: Repository<ReviewRequest>,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ModelEntity)
    private readonly modelRepository: Repository<ModelEntity>,
    @InjectRepository(Vebxrmodel)
    private readonly VebxrmodelRepository: Repository<Vebxrmodel>,
  ) {}

  async createReviewRequest(createReviewRequestDto: Partial<CreateReviewRequestDto>, userId: number) {
    try {
      const reviewRequest = this.reviewRequestRepository.create(createReviewRequestDto);

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
    
      // Fetch the seller associated with the user
      const seller = await this.sellerRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      const modelId = createReviewRequestDto.modelId;
      const model = await this.modelRepository.findOne({ where: { id: modelId } });

      if (!model) {
        throw new NotFoundException('Model not found.');
      }
      // if (model.seller.id !== seller.id) {
      //   throw new BadRequestException('You are not the owner of this model.');
      // }

      reviewRequest.modelOwner = seller;
      reviewRequest.model = model;
      reviewRequest.updatedAt = new Date();
      return await this.reviewRequestRepository.save(reviewRequest);
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException('Failed to create review request. Please check your input.');
    }
  }

  async updateStatus(id: number, resolved: boolean) {
    const reviewRequest = await this.reviewRequestRepository.findOne({ where: { id } });

    if (!reviewRequest) {
      throw new NotFoundException('Review request not found.');
    }

    reviewRequest.resolved = resolved;

    return await this.reviewRequestRepository.save(reviewRequest);
  }

  async deleteReviewRequest(id: number) {
    const reviewRequest = await this.reviewRequestRepository.findOne({ where: { id } });

    if (!reviewRequest) {
      throw new NotFoundException('Review request not found.');
    }

    return await this.reviewRequestRepository.remove(reviewRequest);
  }

  async approveReviewRequest(id: number, userId: number ): Promise<Vebxrmodel> {
    const reviewRequest = await this.reviewRequestRepository.findOne({
      where: { id: id },
      relations: ['category', 'modelOwner', 'model'], // Load related entities
    });

    // const reviewUser = await this.userRepository.findOne({ where: { id: userId } });
    console.log('reviewUser', id);
    console.log('reviewRequest', userId);
  
    if (!reviewRequest) {
      throw new Error('Review request not found');
    }
  
    if (reviewRequest.resolved) {
      throw new Error('Review request is already resolved');
    }

    reviewRequest.resolved = true;
    reviewRequest.reviewer = await this.userRepository.findOne({ where: { id: userId } });
    reviewRequest.updatedAt = new Date();
    await this.reviewRequestRepository.save(reviewRequest);
 
    const Vebxrmodel = this.VebxrmodelRepository.create({
      title: reviewRequest.title,
      description: reviewRequest.description,
      image1Url: reviewRequest.image1Url,
      category: reviewRequest.category,
      tags: reviewRequest.tags,
      downloadType: reviewRequest.downloadType,
      license: reviewRequest.license,
      format: reviewRequest.format.toLocaleUpperCase(),
      price: reviewRequest.price,
      modelOwner: reviewRequest.modelOwner,
      downloads: 0,
      likesCount: 0,
      createdAt: new Date(),
    });
  
    const savedModel = await this.VebxrmodelRepository.save(Vebxrmodel);

    // send images to AI model
    const response = fetch('http://127.0.0.1:5000/submit_ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ImageUrls: [reviewRequest.image1Url, reviewRequest.image2Url, reviewRequest.image3Url],
        description: reviewRequest.description,
      }),
    });

    // if (response.ok) {
    //   const data = await response.json(); 
    //   console.log('Response Data:', data);
    // } else {
    //   console.error('Error:', response.status, response.statusText);
    // }

    return savedModel;
  }

  async declineReviewRequest(id: number, reviewNotes: string, userId: number) {
    const reviewRequest = await this.reviewRequestRepository.findOne({ where: { id } });

    if (!reviewRequest) {
      throw new NotFoundException('Review request not found.');
    }

    if (reviewRequest.resolved) {
      throw new Error('Review request is already resolved');
    }

    // Update the review request with the decline note and mark it as resolved
    reviewRequest.reviewNotes = reviewNotes;
    reviewRequest.resolved = true;
    reviewRequest.reviewer = await this.userRepository.findOne({ where: { id: userId } });
    reviewRequest.rejected = true;
    reviewRequest.updatedAt = new Date();

    return this.reviewRequestRepository.save(reviewRequest);
  }

  async getReviewRequests() {
    return await this.reviewRequestRepository.find({
      relations: ['model', 'modelOwner'],
      where: { resolved: false },
    });
  }

  async getModeratorDashboard() {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
  
    // Find total models not resolved
    const totalReviewRequests = await this.reviewRequestRepository.count({ where: { resolved: false } });
  
    // Find total requests updated in the last 7 days
    const totalReviewRequestsLastWeek = await this.reviewRequestRepository.count({
      where: {
        updatedAt: Between(sevenDaysAgo, now),
      },
    });
  
    // Find total models resolved
    const totalResolvedReviewRequests = await this.reviewRequestRepository.count({ where: { resolved: true } });
  
    // Find total models rejected
    const totalRejectedReviewRequests = await this.reviewRequestRepository.count({ where: { rejected: true } });
  
    // Find total models approved in the last 7 days
    const totalApprovedLastWeek = await this.reviewRequestRepository.count({
      where: {
        resolved: true,
        updatedAt: Between(sevenDaysAgo, now),
      },
    });
  
    // Find total models rejected in the last 7 days
    const totalRejectedLastWeek = await this.reviewRequestRepository.count({
      where: {
        rejected: true,
        updatedAt: Between(sevenDaysAgo, now),
      },
    });
  
    // Calculate improvement percentages
    const improveofreject = totalRejectedReviewRequests > 0 
      ? (totalRejectedLastWeek / totalRejectedReviewRequests) * 100 
      : 0;
  
    const improveofapprove = totalResolvedReviewRequests > 0 
      ? (totalApprovedLastWeek / totalResolvedReviewRequests) * 100 
      : 0;
  
    // Make an array with resolved models count for the last 7 days
    const resolvedCountsLast7Days = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const startOfDay = new Date();
        startOfDay.setDate(now.getDate() - i);
        startOfDay.setHours(0, 0, 0, 0);
  
        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999);
  
        const count = await this.reviewRequestRepository.count({
          where: {
            resolved: true,
            updatedAt: Between(startOfDay, endOfDay),
          },
        });
        return { date: startOfDay.toISOString().split('T')[0], count };
      })
    );
  
    // Contribution to resolve by different users
    const userContributions = await this.reviewRequestRepository
      .createQueryBuilder('reviewRequest')
      .leftJoinAndSelect('reviewRequest.reviewer', 'user') // Join with User entity
      .select('user.firstName', 'firstName')
      .addSelect('COUNT(reviewRequest.id)', 'count')
      .where('reviewRequest.resolved = :resolved', { resolved: true })
      .groupBy('user.firstName')
      .orderBy('count', 'DESC')
      .getRawMany();

  
    return {
      totalReviewRequests,
      totalReviewRequestsLastWeek,
      totalResolvedReviewRequests,
      totalRejectedReviewRequests,
      totalApprovedLastWeek,
      totalRejectedLastWeek,
      improveofreject,
      improveofapprove,
      resolvedCountsLast7Days,
      userContributions,
    };
  }  
  
}
