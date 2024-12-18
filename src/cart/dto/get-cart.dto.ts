import { IsNumber, IsString } from 'class-validator';

export class GetCartDto {

  modelId: number;
  title: string;
  price: number;
  userName: string;
  imageUrl: string;
}
