import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CodeDto {
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  activationCode: string;
}
