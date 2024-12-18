import { Module } from '@nestjs/common';
import { ModelService } from './model.service';
import { ModelController } from './model.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from './entities/model.entity';
import { Seller } from 'src/seller/entities/seller.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModelEntity, Seller, User])],
  controllers: [ModelController],
  providers: [ModelService],
})
export class ModelModule {}
