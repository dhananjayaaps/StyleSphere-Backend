import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateModeratorDto } from './dto/create-moderator.dto';
import { UserRole } from 'src/users/user.entity';
import * as bcrypt from 'bcrypt';
import { Inject } from '@nestjs/common';


@Injectable()
export class ModeratorManageService {

  @Inject(UsersService)
  private readonly usersService: UsersService;
    
  async register(createUserDto: CreateModeratorDto) {
    const { firstName, lastName, email, password, contact ,userName } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const roles = [UserRole.MODERATOR];
    console.log('email', email);

    const existingUser = await this.usersService.findOneByEmail(email);
    console.log('existingUser', existingUser);
    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      roles,
      firstName,
      lastName,
      userName,
    });

    return true;
  }

  async delete(email: string) {
    const existingUser = await this.usersService.findOneByEmail(email);
    if (!existingUser) {
      throw new UnauthorizedException('User not found');
    }

    await this.usersService.delete(existingUser.id);
    return true;
  }

}
