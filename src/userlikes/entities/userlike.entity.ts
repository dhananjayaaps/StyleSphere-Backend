import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Item } from 'src/vebxrmodel/entities/item.entity';

@Entity()
export class UserLikes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Item, (model) => model.likes, { onDelete: 'CASCADE' })
  model: Item;
}
