import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { ModeratorManageService } from './moderator-manage.service';
import { ModeratorManageController } from './moderator-manage.controller';


@Module({
    imports: [
      UsersModule,
      PassportModule,
      JwtModule.register({
        secret: process.env.JWT_SECRET_KEY,
        signOptions: { expiresIn: '60m' },
      }),
      
    ],
    providers: [ModeratorManageService],
    controllers: [ModeratorManageController],
  })
  export class ModeratorManageModule {}