import { UserRole } from '../../users/user.entity';
import { IsString, IsEmail, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  userName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsArray()
  roles: UserRole[];

  @IsString()
  contactNo: String;
}
