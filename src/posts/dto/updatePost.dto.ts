import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @IsArray()
  @IsOptional()
  categories: string[];
}
