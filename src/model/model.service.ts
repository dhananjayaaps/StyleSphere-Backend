import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelEntity } from './entities/model.entity'; 
import { User } from 'src/users/user.entity';
import { Seller } from 'src/seller/entities/seller.entity';

@Injectable()
export class ModelService {
  constructor(
    @InjectRepository(ModelEntity)
    private readonly modelRepository: Repository<ModelEntity>,

    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateModel(filePath: string): Promise<any> {
    try {
      const response = await axios.post('http://localhost:5000/validate', { filePath });
      return response.data;
    } catch (error) {
      throw new HttpException('Validation service error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async saveModelDetails(userId: number, fileName: string, validationResult: any): Promise<ModelEntity> {
    // Fetch the user to ensure it exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
  
    // Fetch the seller associated with the user
    const seller = await this.sellerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  
    if (!seller) {
      throw new Error(`Seller for User with ID ${userId} not found`);
    }

    console.log(validationResult);
  
    // Create and save the model entity
    const model = this.modelRepository.create({
      seller,
      fileName,
      parameters: validationResult.parameters || validationResult,
      valid: validationResult.Valid[1] ?? false, // Use nullish coalescing operator for boolean defaults
    });
  
    return this.modelRepository.save(model);
  }
  
  
}
