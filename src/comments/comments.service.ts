import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { COMMENT_NOT_FOUND_ERROR } from './comments.constants';
import { CommentDto } from './dto';
import { POST_NOT_FOUND_ERROR } from 'src/posts/posts.constants';
import {
  UNAUTHORIZED_ERROR,
  USER_ACCOUNT_IS_BLOCKED_ERROR,
} from 'src/users/users.constants';
import { UserService } from 'src/users/users.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}
  async create(userId: string, { description, postId }: CommentDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        author: {
          select: {
            blockings: true,
          },
        },
      },
    });
    if (!post) {
      throw new BadRequestException(POST_NOT_FOUND_ERROR);
    }
    // Check if the author of the post blocked current user
    const blockings = post.author.blockings.map((blocking) => blocking.id);
    const isBlocked = blockings.includes(userId);
    if (isBlocked) {
      throw new UnauthorizedException(USER_ACCOUNT_IS_BLOCKED_ERROR);
    }
    return this.prisma.comment.create({
      data: {
        description,
        postId,
        userId,
      },
      include: {
        post: true,
        user: {
          select: this.userService.getUserSelectFields(),
        },
      },
    });
  }

  allComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId: postId },
      include: {
        user: {
          select: this.userService.getUserSelectFields(),
        },
      },
    });
  }

  async oneComment(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: this.userService.getUserSelectFields(),
        },
      },
    });
    if (!comment) {
      throw new BadRequestException(COMMENT_NOT_FOUND_ERROR);
    }
    return comment;
  }

  async update(commentId: string, userId: string, { description }: CommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new BadRequestException(COMMENT_NOT_FOUND_ERROR);
    }
    if (userId !== comment.userId) {
      throw new UnauthorizedException(UNAUTHORIZED_ERROR);
    }
    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        description,
      },
      include: {
        user: {
          select: this.userService.getUserSelectFields(),
        },
      },
    });
  }

  async delete(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new UnauthorizedException(UNAUTHORIZED_ERROR);
    }
    if (userId !== comment.userId) {
      throw new UnauthorizedException(UNAUTHORIZED_ERROR);
    }
    await this.prisma.comment.delete({ where: { id: commentId } });
  }
}
