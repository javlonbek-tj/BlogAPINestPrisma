import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePassDto {
  @IsNotEmpty()
  oldPass: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  newPass: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  newPassConfirm: string;
}
