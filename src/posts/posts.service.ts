import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { UNAUTHORIZED_ERROR } from 'src/users/users.constants';
import { FileService } from 'src/files/files';
import { UserService } from 'src/users/users.service';
import { POST_NOT_FOUND_ERROR } from './posts.constants';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
    private userService: UserService,
  ) {}
  async create(
    authorId: string,
    image: Express.Multer.File,
    { title, description, categories }: CreatePostDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: authorId } });
    if (user.isBlocked) {
      throw new UnauthorizedException(UNAUTHORIZED_ERROR);
    }
    const postImage = await this.fileService.createFile(image);
    const post = await this.prisma.post.create({
      data: {
        title,
        description,
        postImage,
        authorId,
        category: {
          connect: categories.map((category) => ({ id: category })),
        },
      },
    });
    await this.prisma.user.update({
      where: { id: authorId },
      data: {
        lastPostDate: new Date(),
      },
    });
    return post;
  }

  async allPosts(userId: string) {
    const posts = await this.prisma.post.findMany({
      include: {
        author: {
          select: this.userService.getUserSelectFields(),
        },
        likes: {
          select: {
            id: true,
          },
        },
        dislikes: {
          select: {
            id: true,
          },
        },
        numViews: {
          select: {
            id: true,
          },
        },
        comments: {
          select: {
            id: true,
          },
        },
        category: {
          select: {
            title: true,
          },
        },
      },
    });
    const filteredPosts = posts.filter((post) => {
      const blockingUsers = post.author.blockings.map(
        (blocking) => blocking.id,
      );
      const isBlocked = blockingUsers.includes(userId);
      return isBlocked ? null : post;
    });
    return filteredPosts;
  }

  async onePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: this.getPostInclude(),
    });
    if (!post) {
      throw new BadRequestException(POST_NOT_FOUND_ERROR);
    }
    const viewers = post.numViews.map((viewer) => viewer.id);
    const isViewed = viewers.includes(userId);
    if (isViewed) {
      return post;
    }
    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        numViews: {
          connect: { id: userId },
        },
      },
      include: this.getPostInclude(),
    });
    return updatedPost;
  }

  async updatePost(
    postId: string,
    userId: string,
    image: Express.Multer.File,
    dto: UpdatePostDto,
  ) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new BadRequestException(POST_NOT_FOUND_ERROR);
    }
    if (post.authorId !== userId) {
      throw new UnauthorizedException(UNAUTHORIZED_ERROR);
    }
    let postImage: string;
    if (image) {
      if (post.postImage) {
        await this.fileService.deleteFile(post.postImage);
      }
      postImage = await this.fileService.createFile(image);
    }
    return this.prisma.post.update({
      where: { id: postId },
      data: { ...dto, postImage },
    });
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new BadRequestException(POST_NOT_FOUND_ERROR);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: {
          select: {
            value: true,
          },
        },
      },
    });
    if (post.authorId === userId || user.role.value === 'ADMIN') {
      return this.prisma.post.delete({ where: { id: postId } });
    } else {
      throw new UnauthorizedException(UNAUTHORIZED_ERROR);
    }
  }

  async toggleLikes(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: this.getLikesDislikesInclude(),
    });
    if (!post) {
      throw new BadRequestException(POST_NOT_FOUND_ERROR);
    }
    const likes = post.likes.map((like) => like.id);
    const isLiked = likes.includes(userId);
    if (isLiked) {
      const updatePost = await this.prisma.post.update({
        where: { id: postId },
        data: {
          likes: {
            disconnect: { id: userId },
          },
        },
        include: this.getLikesDislikesInclude(),
      });
      return updatePost;
    }
    return await this.prisma.post.update({
      where: { id: postId },
      data: {
        likes: {
          connect: { id: userId },
        },
        dislikes: {
          disconnect: { id: userId },
        },
      },
      include: this.getLikesDislikesInclude(),
    });
  }

  async toggleDisLikes(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: this.getLikesDislikesInclude(),
    });
    if (!post) {
      throw new BadRequestException(POST_NOT_FOUND_ERROR);
    }
    const disLikes = post.dislikes.map((dislike) => dislike.id);
    const isDisLiked = disLikes.includes(userId);
    if (isDisLiked) {
      const updatePost = await this.prisma.post.update({
        where: { id: postId },
        data: {
          dislikes: {
            disconnect: { id: userId },
          },
        },
        include: this.getLikesDislikesInclude(),
      });
      return updatePost;
    }
    return await this.prisma.post.update({
      where: { id: postId },
      data: {
        dislikes: {
          connect: { id: userId },
        },
        likes: {
          disconnect: { id: userId },
        },
      },
      include: this.getLikesDislikesInclude(),
    });
  }

  getPostInclude() {
    return {
      author: { select: this.userService.getUserSelectFields() },
      likes: { select: this.userService.getUserSelectFields() },
      dislikes: { select: this.userService.getUserSelectFields() },
      numViews: { select: this.userService.getUserSelectFields() },
      comments: true,
      category: { select: { title: true } },
    };
  }

  getLikesDislikesInclude() {
    return {
      likes: { select: { id: true } },
      dislikes: { select: { id: true } },
    };
  }
}
