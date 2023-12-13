import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPassDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  passwordConfirm: string;
}
