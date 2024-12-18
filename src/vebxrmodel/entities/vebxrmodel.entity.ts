import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Seller } from 'src/seller/entities/seller.entity';
import { Category } from 'src/category/category.entity';
import { ModelEntity } from 'src/model/entities/model.entity';
import { UserLikes } from 'src/userlikes/entities/userlike.entity';

@Entity()
export class Vebxrmodel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: false })
  image1Url: string;

  @ManyToOne(() => Category, (category) => category.models, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column('text', { array: true })
  tags: string[];

  @Column({ nullable: true, default: 'No' })
  downloadType: string;

  @Column({ nullable: true })
  license: string;

  @Column({ nullable: true })
  format: string;

  @Column({ type: 'float', default: 0 })
  price: number;

  @Column({ default: 0 })
  downloads: number;

  @Column({ default: 0 })
  totalReviews: number;

  @Column({ default: 0 })
  likesCount: number;

  @ManyToOne(() => Seller, (seller) => seller.vebxrmodels, { nullable: false })
  @JoinColumn({ name: 'model_owner_id' })
  modelOwner: Seller;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UserLikes, (userLikes) => userLikes.model)
  likes: UserLikes[];

  @Column({ type: 'float', default: 0 })
  review: number;
}
