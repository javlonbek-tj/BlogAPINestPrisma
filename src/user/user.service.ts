import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from '../auth/dto/signup.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RoleService } from '../role/role.service';
import { TokenService } from '../auth/token.service';
import { UpdatePassDto, UpdateUserDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { PASSWORD_DO_NOT_MATCH_ERROR } from '../auth/auth.constants';
import {
  OLD_PASSWORD_IS_INCORRECT_ERROR,
  TOKEN_INVALID_OR_EXPIRED_ERROR,
  USER_ALREADY_BLOCKED_ERROR,
  USER_IS_NOT_BLOCKED_ERROR,
  USER_NOT_FOUND_ERROR,
  YOU_ALREADY_BLOCKED_THIS_USER_ERROR,
  YOU_ALREADY_FOLLOWED_THIS_USER_ERROR,
  YOU_HAVE_NOT_BLOCKED_THIS_USER_ERROR,
  YOU_HAVE_NOT_FOLLOWED_THIS_USER_ERROR,
} from './user.constants';
import { ResetPassDto } from './dto';
import { MailService } from '../mail/mail.service';
import { FileService } from '../file/file.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private roleService: RoleService,
    private tokenService: TokenService,
    private config: ConfigService,
    private mailService: MailService,
    private fileService: FileService,
  ) {}

  async createUser(dto: SignupDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const { firstname, lastname, email } = dto;
    const role = await this.roleService.getRoleByValue('USER');
    const randomSixDigitNumber = Math.floor(Math.random() * 900000) + 100000;
    const numberAsString = randomSixDigitNumber.toString();
    const hashedActivationCode = crypto
      .createHash('sha256')
      .update(numberAsString)
      .digest('hex');
    const activationCodeExpires: Date = new Date();
    activationCodeExpires.setMinutes(activationCodeExpires.getMinutes() + 1);
    const user = await this.prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        activationCode: hashedActivationCode,
        activationCodeExpires,
        roleId: role.id,
      },
    });
    return { user, randomSixDigitNumber };
  }

  findUser(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOne(userId: string, viewerId: string) {
    const userToBeViewed = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.getUserSelectFields(),
    });
    if (userToBeViewed && viewerId) {
      if (userToBeViewed.posts.length <= 0) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            userAward: 'BRONZE',
          },
        });
      }
      if (userToBeViewed.posts.length > 10) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            userAward: 'SILVER',
          },
        });
      }
      if (userToBeViewed.posts.length > 20) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            userAward: 'GOLD',
          },
        });
      }
      const isUserAlreadyViewed = userToBeViewed.viewers.find(
        (viewer) => viewer.id === viewerId,
      );
      if (isUserAlreadyViewed) {
        return userToBeViewed;
      }
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          viewers: {
            set: [
              ...userToBeViewed.viewers.map((v) => ({ id: v.id })),
              { id: viewerId },
            ],
          },
        },
        select: this.getUserSelectFields(),
      });
      return updatedUser;
    }
    throw new BadRequestException(USER_NOT_FOUND_ERROR);
  }

  async profileViewers(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        viewers: {
          select: this.getUserSelectFields(),
        },
      },
    });
    if (!user) {
      throw new BadRequestException(USER_NOT_FOUND_ERROR);
    }
    return user;
  }

  async followUser(followedUserId: string, followingUserId: string) {
    const userToBeFollowed = await this.prisma.user.findUnique({
      where: { id: followedUserId },
      select: this.getUserSelectFields(),
    });
    const followingUser = await this.prisma.user.findUnique({
      where: { id: followingUserId },
      select: this.getUserSelectFields(),
    });
    if (userToBeFollowed && followingUser) {
      const isUserAlreadyFollowed = followingUser.followings.find(
        (following) => following.id === followedUserId,
      );
      if (isUserAlreadyFollowed) {
        throw new BadRequestException(YOU_ALREADY_FOLLOWED_THIS_USER_ERROR);
      }
      await this.prisma.user.update({
        where: { id: followedUserId },
        data: {
          followers: {
            set: [
              ...userToBeFollowed.followers.map((f) => ({ id: f.id })),
              { id: followingUserId },
            ],
          },
        },
      });
      const updatedFollowingUser = await this.prisma.user.update({
        where: { id: followingUserId },
        data: {
          followings: {
            set: [
              ...followingUser.followings.map((f) => ({ id: f.id })),
              { id: followedUserId },
            ],
          },
        },
        select: this.getUserSelectFields(),
      });
      return updatedFollowingUser;
    }
    throw new BadRequestException(USER_NOT_FOUND_ERROR);
  }

  async unFollowUser(unFollowedUserId: string, unFollowingUserId: string) {
    const userToBeUnFollowed = await this.prisma.user.findUnique({
      where: { id: unFollowedUserId },
      select: this.getUserSelectFields(),
    });
    const unFollowingUser = await this.prisma.user.findUnique({
      where: { id: unFollowingUserId },
      select: this.getUserSelectFields(),
    });
    if (userToBeUnFollowed && unFollowingUser) {
      const isUserAlreadyUnFollowed = unFollowingUser.followings.find(
        (unFollowing) => unFollowing.id === unFollowedUserId,
      );
      if (!isUserAlreadyUnFollowed) {
        throw new BadRequestException(YOU_HAVE_NOT_FOLLOWED_THIS_USER_ERROR);
      }
      await this.prisma.user.update({
        where: { id: unFollowedUserId },
        data: {
          followers: {
            set: userToBeUnFollowed.followers.filter(
              (follower) => follower.id !== unFollowingUserId,
            ),
          },
        },
      });
      const updatedUnFollowingUser = await this.prisma.user.update({
        where: { id: unFollowingUserId },
        data: {
          followings: {
            set: unFollowingUser.followings.filter(
              (following) => following.id !== unFollowedUserId,
            ),
          },
        },
        select: this.getUserSelectFields(),
      });

      return updatedUnFollowingUser;
    }
    throw new BadRequestException(USER_NOT_FOUND_ERROR);
  }

  async blockUser(blockedUserId: string, blockingUserId: string) {
    const userToBeBlocked = await this.prisma.user.findUnique({
      where: { id: blockedUserId },
      select: this.getUserSelectFields(),
    });
    const blockingUser = await this.prisma.user.findUnique({
      where: { id: blockingUserId },
      select: this.getUserSelectFields(),
    });
    if (userToBeBlocked && blockingUser) {
      const isUserAlreadyBlocked = blockingUser.blockings.find(
        (blocking) => blocking.id === blockedUserId,
      );
      if (isUserAlreadyBlocked) {
        throw new BadRequestException(YOU_ALREADY_BLOCKED_THIS_USER_ERROR);
      }
      const updatedBlockingUser = await this.prisma.user.update({
        where: { id: blockingUserId },
        data: {
          blockings: {
            set: [
              ...blockingUser.blockings.map((b) => ({ id: b.id })),
              { id: blockedUserId },
            ],
          },
        },
        select: this.getUserSelectFields(),
      });
      return updatedBlockingUser;
    }
    throw new BadRequestException(USER_NOT_FOUND_ERROR);
  }

  async unBlockUser(unBlockedUserId: string, unBlockingUserId: string) {
    const userToBeUnBlocked = await this.prisma.user.findUnique({
      where: { id: unBlockedUserId },
      select: this.getUserSelectFields(),
    });
    const unBlockingUser = await this.prisma.user.findUnique({
      where: { id: unBlockingUserId },
      select: this.getUserSelectFields(),
    });
    if (userToBeUnBlocked && unBlockingUser) {
      const isUserAlreadyUnBlocked = unBlockingUser.blockings.find(
        (blocking) => blocking.id === unBlockedUserId,
      );
      if (!isUserAlreadyUnBlocked) {
        throw new BadRequestException(YOU_HAVE_NOT_BLOCKED_THIS_USER_ERROR);
      }
      const updatedUnBlockingUser = await this.prisma.user.update({
        where: { id: unBlockingUserId },
        data: {
          blockings: {
            set: unBlockingUser.blockings.filter(
              (unBlocking) => unBlocking.id !== unBlockedUserId,
            ),
          },
        },
        select: this.getUserSelectFields(),
      });
      return updatedUnBlockingUser;
    }
    throw new BadRequestException(USER_NOT_FOUND_ERROR);
  }

  async adminBlockUser(userId: string) {
    const userToBeBlocked = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userToBeBlocked) {
      throw new BadRequestException(USER_NOT_FOUND_ERROR);
    }
    if (userToBeBlocked.isBlocked) {
      throw new BadRequestException(USER_ALREADY_BLOCKED_ERROR);
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: true,
      },
      select: this.getUserSelectFields(),
    });
  }

  async adminUnBlockUser(userId: string) {
    const userToBeUnBlocked = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userToBeUnBlocked) {
      throw new BadRequestException(USER_NOT_FOUND_ERROR);
    }
    if (!userToBeUnBlocked.isBlocked) {
      throw new BadRequestException(USER_IS_NOT_BLOCKED_ERROR);
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: false,
      },
      select: this.getUserSelectFields(),
    });
  }

  async updateUserInfo(
    userId: string,
    dto: UpdateUserDto,
    image: Express.Multer.File,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { profilPhoto: true },
    });

    if (!existingUser) {
      throw new BadRequestException('User not found');
    }
    if (dto.email) {
      const isEmailTaken = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (isEmailTaken) {
        throw new BadRequestException(`${dto.email} is already taken`);
      }
    }
    let dataToUpdate: UpdateUserDto = {};

    if (dto.firstname) {
      dataToUpdate.firstname = dto.firstname;
    }

    if (dto.lastname) {
      dataToUpdate.lastname = dto.lastname;
    }

    if (dto.email) {
      dataToUpdate.email = dto.email;
    }

    if (image) {
      if (existingUser.profilPhoto) {
        await this.fileService.deleteFile(existingUser.profilPhoto);
      }
      const fileName = await this.fileService.createFile(image);

      dataToUpdate.profilPhoto = fileName;
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: this.getUserSelectFields(),
    });
  }

  async changeUserPassword(
    userId: string,
    { oldPass, newPass, newPassConfirm }: UpdatePassDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(USER_NOT_FOUND_ERROR);
    }
    const isPassEquals = await bcrypt.compare(oldPass, user.password);
    if (!isPassEquals) {
      throw new BadRequestException(OLD_PASSWORD_IS_INCORRECT_ERROR);
    }
    if (newPass !== newPassConfirm) {
      throw new BadRequestException(PASSWORD_DO_NOT_MATCH_ERROR);
    }
    const hashPassword = await bcrypt.hash(newPass, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashPassword,
        passwordChangedAt: new Date(),
      },
      select: this.getUserSelectFields(),
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException(USER_NOT_FOUND_ERROR);
    }
    const resetToken = await this.createPasswordResetToken(email);
    // Send resetUrl to user's email
    try {
      const subject = 'Your password reset token (valid for only 10 minutes)';
      const baseUrl = this.config.get<string>('API_URL');
      const link = `${baseUrl}/users/resetPassword/${resetToken}`;
      const html = `<div>
            <h1>For reset password hit this link</h1>
            <a href="${link}">Reset Password</a>
            </div>`;
      await this.mailService.sendMail(email, subject, html);
      return {
        status: 'success',
        message: 'Password reset link has been sent to your email!',
      };
    } catch (e) {
      this.prisma.user.update({
        where: { email },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
    }
  }

  async resetPassword(resetToken: string, dto: ResetPassDto) {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException(PASSWORD_DO_NOT_MATCH_ERROR);
    }
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
      select: this.getUserSelectFields(),
    });
    if (!user) {
      throw new BadRequestException(TOKEN_INVALID_OR_EXPIRED_ERROR);
    }
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException(PASSWORD_DO_NOT_MATCH_ERROR);
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date(),
      },
    });
    const tokens = await this.tokenService.generateTokens({
      sub: user.id,
      email: user.email,
    });
    await this.tokenService.saveToken(user.id, tokens.refreshToken);
    return { ...tokens, user };
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  async createPasswordResetToken(email: string) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const passwordResetExpires: Date = new Date();
    passwordResetExpires.setMinutes(passwordResetExpires.getMinutes() + 10);
    await this.prisma.user.update({
      where: { email },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });
    return resetToken;
  }

  getUserSelectFields(includePassword = false) {
    return {
      id: true,
      firstname: true,
      lastname: true,
      profilPhoto: true,
      email: true,
      isBlocked: true,
      role: true,
      userAward: true,
      isActivated: true,
      viewers: { select: { id: true } },
      followers: { select: { id: true } },
      followings: { select: { id: true } },
      posts: { select: { id: true } },
      comments: { select: { id: true } },
      blockings: { select: { id: true } },
      password: includePassword,
      lastPostDate: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
