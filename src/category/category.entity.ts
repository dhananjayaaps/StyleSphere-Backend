// category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Vebxrmodel } from '../vebxrmodel/entities/vebxrmodel.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Vebxrmodel, (model) => model.category)
  models: Vebxrmodel[];
}
