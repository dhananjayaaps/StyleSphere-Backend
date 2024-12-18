import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Vebxrmodel } from 'src/vebxrmodel/entities/vebxrmodel.entity';

@Entity()
export class UserLikes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Vebxrmodel, (model) => model.likes, { onDelete: 'CASCADE' })
  model: Vebxrmodel;
}
