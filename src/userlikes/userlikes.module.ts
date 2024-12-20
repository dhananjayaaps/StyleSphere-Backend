import { Module } from '@nestjs/common';
import { UserLikesService } from './userlikes.service';
import { UserLikesController } from './userlikes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UserLikes } from './entities/userlike.entity';
import { Item } from 'src/vebxrmodel/entities/item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserLikes, Item]),
  ],
  controllers: [UserLikesController],
  providers: [UserLikesService],
})
export class UserlikesModule {}
