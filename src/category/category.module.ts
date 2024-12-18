import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { Category } from './category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category])], // Register the CategoryRepository here
  providers: [CategoryService],
  exports: [CategoryService], // Export CategoryService to use it in other modules
})
export class CategoryModule {}
