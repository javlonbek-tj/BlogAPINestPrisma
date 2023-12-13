import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CurrentUser } from 'src/users/decorators/currentUser.decorator';
import { JwtPayload } from 'src/auth/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePostDto, UpdatePostDto } from './dto';
import { JwtAuthGuard } from 'src/users/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private postService: PostsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('postImage'))
  async createPost(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file || !file.mimetype.includes('image')) {
      throw new BadRequestException(
        'Uploaded file is not image. Please upload only an image.',
      );
    }
    return this.postService.create(user.sub, file, dto);
  }

  @Get()
  async allPosts(@CurrentUser() user: JwtPayload) {
    return this.postService.allPosts(user.sub);
  }

  @Get('/:id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.postService.onePost(id, user.sub);
  }

  @Put('/:id')
  @UseInterceptors(FileInterceptor('postImage'))
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postService.updatePost(id, user.sub, file, dto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.postService.deletePost(id, user.sub);
  }

  @Put('/likes/:id')
  async toggleLikes(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.postService.toggleLikes(id, user.sub);
  }

  @Put('/dislikes/:id')
  async toggleDisLikes(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postService.toggleDisLikes(id, user.sub);
  }
}
