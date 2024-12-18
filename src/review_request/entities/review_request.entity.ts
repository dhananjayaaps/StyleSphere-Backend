import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
  } from 'typeorm';
  import { User } from 'src/users/user.entity';
  import { Vebxrmodel } from 'src/Vebxrmodel/entities/Vebxrmodel.entity';
  import { Seller } from 'src/seller/entities/seller.entity';
  import { Category } from 'src/category/category.entity';
import { ModelEntity } from 'src/model/entities/model.entity';
  
  @Entity()
  export class ReviewRequest {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'reviewer_id' })
    reviewer: User;
  
    @Column('text', { nullable: true })
    reviewNotes: string;
  
    @Column({ default: false })
    resolved: boolean;
  
    // Fields for Vebxrmodel creation after approval
    @Column({ length: 255 })
    title: string;
  
    @Column('text')
    description: string;
  
    @Column()
    modelUrl: string;
  
    @Column({ nullable: false })
    image1Url: string;
  
    @Column({ nullable: false })
    image2Url: string;
  
    @Column({ nullable: false })
    image3Url: string;
  
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
  
    @ManyToOne(() => Seller, (seller) => seller.models, { nullable: false })
    @JoinColumn({ name: 'model_owner_id' })
    modelOwner: Seller;

    @OneToOne(() => ModelEntity, (model) => model.reviewRequest, { nullable: false })
    @JoinColumn({ name: 'model_id' })
    model: ModelEntity;

    @Column({ default: false })
    rejected: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @CreateDateColumn()
    updatedAt: Date;
  }
  