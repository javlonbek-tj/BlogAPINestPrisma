import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsOptional()
  firstname?: string;

  @IsNotEmpty()
  @IsOptional()
  lastname?: string;

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email?: string;

  @IsNotEmpty()
  @IsOptional()
  profilPhoto?: string;
}
