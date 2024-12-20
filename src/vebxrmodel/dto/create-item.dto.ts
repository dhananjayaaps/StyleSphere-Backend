export class CreateItemDto {
  title: string;
  description: string;
  image1Url: string;
  category: number;
  tags: string[];
  downloadType: string;
  license: string;
  format: string;
  price: number;
}
