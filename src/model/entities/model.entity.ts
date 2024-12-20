import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Seller } from 'src/seller/entities/seller.entity';

@Entity('models')
export class ModelEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Seller, (seller) => seller.models, { onDelete: 'CASCADE' })
  seller: Seller;

  @Column()
  fileName: string;

  @Column('jsonb')
  parameters: any;

  @Column({ type: 'boolean', default: true })
  valid: boolean;
}
