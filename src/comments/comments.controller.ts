import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto } from './dto';
import { JwtAuthGuard } from 'src/users/guards/jwt.guard';
import { CurrentUser } from 'src/users/decorators/currentUser.decorator';
import { JwtPayload } from 'src/auth/types';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private commentService: CommentsService) {}

  @Post()
  create(@Body() dto: CommentDto, @CurrentUser() user: JwtPayload) {
    return this.commentService.create(user.sub, dto);
  }

  @Get('/:postId')
  allComments(@Param('postId') postId: string) {
    return this.commentService.allComments(postId);
  }

  @Get('/:id')
  oneComment(@Param('id') id: string) {
    return this.commentService.oneComment(id);
  }

  @Put('/:id')
  updateCategory(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CommentDto,
  ) {
    return this.commentService.update(id, user.sub, dto);
  }

  @Delete('/:id')
  deleteComment(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.commentService.delete(user.sub, id);
  }
}
