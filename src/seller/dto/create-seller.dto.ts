// create-seller.dto.ts
import { IsEmail, IsString, IsOptional, Length, IsArray, IsUrl } from 'class-validator';

export class CreateSellerDto {
  @IsString()
  @Length(3, 255)
  displayName: string;

  @IsString()
  @Length(10, 2000)
  biography: string;

  @IsOptional()
  @IsUrl()
  profilePicture: string;

  @IsOptional()
  @IsUrl()
  personalWebsite: string;

  @IsOptional()
  @IsString()
  twitterUsername: string;

  @IsOptional()
  @IsString()
  facebookUsername: string;

  @IsOptional()
  @IsString()
  linkedInUsername: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsOptional()
  @IsString()
  @Length(10, 15)
  contactNumber: string;

  @IsString()
  @Length(3, 255)
  bankName: string;

  @IsString()
  @Length(3, 255)
  accountNumber: string;

  @IsString()
  @Length(3, 255)
  branch: string;

  @IsString()
  @Length(3, 255)
  accountName: string;
}
