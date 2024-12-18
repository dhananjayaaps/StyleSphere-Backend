// update-seller.dto.ts
import { IsOptional, IsString, IsEmail, Length, IsArray, IsUrl } from 'class-validator';

export class UpdateSellerDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Length(10, 2000)
  biography?: string;

  @IsOptional()
  @IsUrl()
  profilePicture?: string;

  @IsOptional()
  @IsUrl()
  personalWebsite?: string;

  @IsOptional()
  @IsString()
  twitterUsername?: string;

  @IsOptional()
  @IsString()
  facebookUsername?: string;

  @IsOptional()
  @IsString()
  linkedInUsername?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  @Length(10, 15)
  contactNumber?: string;

  @IsOptional()
  @IsString()
  @Length(3, 255)
  bankName?: string;

  @IsOptional()
  @IsString()
  @Length(3, 255)
  accountNumber?: string;

  @IsOptional()
  @IsString()
  @Length(3, 255)
  branch?: string;

  @IsOptional()
  @IsString()
  @Length(3, 255)
  accountName?: string;
}
