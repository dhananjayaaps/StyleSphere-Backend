import { Module } from '@nestjs/common';
import { UserLikesService } from './userlikes.service';
import { UserLikesController } from './userlikes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UserLikes } from './entities/userlike.entity';
import { Vebxrmodel } from 'src/vebxrmodel/entities/vebxrmodel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserLikes, Vebxrmodel]),
  ],
  controllers: [UserLikesController],
  providers: [UserLikesService],
})
export class UserlikesModule {}
