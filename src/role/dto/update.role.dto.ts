import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  value: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  description: string;
}
