// payment.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Item } from 'src/vebxrmodel/entities/item.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Item, (model) => model.id, { eager: true })
  @JoinColumn({ name: 'modelId' })
  model: Item;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  purchasedAt: Date;

  @Column({ nullable: true })
  reviewMessage: string;

  @Column({ type: 'int', nullable: true })
  reviewStars: number;

  // status of payment
  @Column({ default: 'pending' })
  status: string;
}
