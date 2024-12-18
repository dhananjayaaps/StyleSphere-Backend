import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsArray,
  } from 'class-validator';
  
  export class CreateReviewRequestDto {
    @IsString()
    @IsNotEmpty()
    title: string;
  
    @IsString()
    @IsNotEmpty()
    description: string;
  
    @IsString()
    @IsNotEmpty()
    modelUrl: string;
  
    @IsString()
    @IsNotEmpty()
    image1Url: string;
  
    @IsString()
    @IsNotEmpty()
    image2Url: string;
  
    @IsString()
    @IsNotEmpty()
    image3Url: string;
  
    @IsNumber()
    @IsNotEmpty()
    categoryId: number;
  
    @IsArray()
    @IsNotEmpty()
    tags: string[];
  
    @IsString()
    @IsOptional()
    downloadType: string;
  
    @IsString()
    @IsOptional()
    license: string;
  
    @IsString()
    @IsOptional()
    format: string;
  
    @IsNumber()
    @IsNotEmpty()
    price: number;
  
    @IsNumber()
    @IsNotEmpty()
    modelId?: number;
  
    @IsBoolean()
    @IsOptional()
    resolved?: boolean;
  }
  