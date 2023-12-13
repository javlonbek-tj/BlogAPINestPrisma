import { IsNotEmpty, IsString } from 'class-validator';

export class CommentDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  postId: string;
}
