import { IsNotEmpty, IsString } from 'class-validator';

export class CategoryDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}
