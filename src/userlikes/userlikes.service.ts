import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLikes } from './entities/userlike.entity'; 
import { User } from 'src/users/user.entity';
import { Item } from 'src/vebxrmodel/entities/item.entity';

@Injectable()
export class UserLikesService {
  constructor(
    @InjectRepository(UserLikes)
    private readonly userLikesRepository: Repository<UserLikes>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Item)
    private readonly vebxrModelRepository: Repository<Item>,
  ) {}

  async likeModel(userId: number, modelId: number): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const model = await this.vebxrModelRepository.findOne({ where: { id: modelId } });

    if (!user || !model) {
      throw new Error('User or model not found.');
    }

    const existingLike = await this.userLikesRepository.findOne({
      where: { user: { id: userId }, model: { id: modelId } },
    });

    if (existingLike) {
      throw new Error('You already liked this model.');
    }

    const like = this.userLikesRepository.create({ user, model });
    await this.userLikesRepository.save(like);

    // Optionally, increment the likes count in Vebxrmodel
    model.likesCount += 1;
    await this.vebxrModelRepository.save(model);

    return 'Model liked successfully.';
  }

  async unlikeModel(userId: number, modelId: number): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const model = await this.vebxrModelRepository.findOne({ where: { id: modelId } });

    if (!user || !model) {
      throw new Error('User or model not found.');
    }

    const existingLike = await this.userLikesRepository.findOne({
      where: { user: { id: userId }, model: { id: modelId } },
    });

    if (!existingLike) {
      throw new Error('You have not liked this model.');
    }

    await this.userLikesRepository.remove(existingLike);

    // Optionally, decrement the likes count in Vebxrmodel
    model.likesCount -= 1;
    await this.vebxrModelRepository.save(model);

    return 'Model unliked successfully.';
  }

  // getMyLikedModels
  async getMyLikedModels(userId: number) {
    
    return this.userLikesRepository.find({
      where: { user: { id: userId } },
      relations: ['model'],
    });
  }
  
}
