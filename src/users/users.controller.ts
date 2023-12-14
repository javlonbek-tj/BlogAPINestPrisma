import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtPayload } from '../auth/types';
import { CurrentUser } from './decorators/currentUser.decorator';
import { EmailDto, ResetPassDto, UpdatePassDto, UpdateUserDto } from './dto';
import { UserService } from './users.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/viewers')
  profileViewers(@CurrentUser() user: JwtPayload) {
    return this.userService.profileViewers(user.sub);
  }

  @Get('/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.userService.findOne(id, user.sub);
  }

  @Get('/following/:id')
  followUser(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.userService.followUser(id, user.sub);
  }

  @Get('/unfollowing/:id')
  unFollowUser(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.userService.unFollowUser(id, user.sub);
  }

  @Get('/blocking/:id')
  blockUser(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.userService.blockUser(id, user.sub);
  }

  @Get('/unblocking/:id')
  unBlockUser(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.userService.unBlockUser(id, user.sub);
  }

  @Get('/admin-block/:id')
  adinBlockUser(@Param('id') id: string) {
    return this.userService.adminBlockUser(id);
  }

  @Get('/admin-unblock/:id')
  adinUnBlockUser(@Param('id') id: string) {
    return this.userService.adminUnBlockUser(id);
  }

  @Put('/')
  @UseInterceptors(FileInterceptor('profilePhoto'))
  updateUserInfo(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file || !file.mimetype.includes('image')) {
      throw new BadRequestException(
        'Uploaded file is not image. Please upload only an image.',
      );
    }
    return this.userService.updateUserInfo(user.sub, dto, file);
  }

  @Put('/change-password')
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: UpdatePassDto) {
    return this.userService.changeUserPassword(user.sub, dto);
  }

  @Post('/forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() { email }: EmailDto) {
    return this.userService.forgotPassword(email);
  }

  @Put('/reset-password/:resetToken')
  resetPassword(
    @Param('resetToken') resetToken: string,
    @Body() password: ResetPassDto,
  ) {
    return this.userService.resetPassword(resetToken, password);
  }

  @Delete('/blocking/:id')
  deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.userService.deleteAccount(user.sub);
  }
}
