// category.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // Method to seed initial categories
  async seedCategories() {
    const categories = [
      { name: "Select Category" },
      { name: "Men's Wear" },
      { name: "Women's Wear" },
      { name: "Kids' Wear" },
      { name: "Casual Wear" },
      { name: "Formal Wear" },
      { name: "Sportswear" },
      { name: "Traditional Clothing" },
      { name: "Accessories" },
      { name: "Footwear" },
      { name: "Custom Designs" },
      { name: "Boutique Collections" },
    ];

    // Insert categories if the table is empty
    const count = await this.categoryRepository.count();
    if (count === 0) {
      await this.categoryRepository.save(categories);
      console.log('Categories seeded successfully');
    } else {
      console.log('Categories already exist');
    }
  }
}
