import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto } from './dto';
import { CurrentUser } from 'src/users/decorators/currentUser.decorator';
import { JwtPayload } from 'src/auth/types';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { Roles } from 'src/guards/roles.guard';

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

  @UseGuards(Roles('ADMIN', 'USER'))
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteComment(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.commentService.delete(user.sub, id);
  }
}
