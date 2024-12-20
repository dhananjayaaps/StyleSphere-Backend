import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { ModelEntity } from 'src/model/entities/model.entity';
import { Item } from 'src/vebxrmodel/entities/item.entity';

@Entity('seller')
export class Seller {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.seller)
  @JoinColumn()
  user: User;

  @Column({ type: 'varchar', length: 255 })
  displayName: string;

  @Column({ type: 'text' })
  biography: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profilePicture: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  personalWebsite: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  twitterUsername: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  facebookUsername: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  linkedInUsername: string;

  @Column('simple-array')
  skills: string[];

  @Column({ type: 'varchar', length: 15, nullable: true })
  contactNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 255 })
  bankName: string;

  @Column({ type: 'varchar', length: 255 })
  accountNumber: string;

  @Column({ type: 'varchar', length: 255 })
  branch: string;

  @Column({ type: 'varchar', length: 255 })
  accountName: string;

  @Column({ type: 'float', default: 0 })
  accountBalance: number;

  @Column({ type: 'float', default: 0 })
  totalEarnings: number;

  @OneToMany(() => Transaction, (transaction) => transaction.seller)
  transactions: Transaction[];

  @OneToMany(() => ModelEntity, (model) => model.seller)
  models: ModelEntity[];

  @OneToMany(() => Item, (model) => model.modelOwner)
  vebxrmodels: Item[];
}
