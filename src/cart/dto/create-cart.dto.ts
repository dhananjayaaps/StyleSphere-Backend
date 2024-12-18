import { IsInt, IsNotEmpty, IsPositive, IsOptional } from 'class-validator';

export class CreateCartDto {

  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  modelId: number;
}
