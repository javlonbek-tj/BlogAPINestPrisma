import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtPayload } from '../auth/types';
import { CurrentUser } from './decorators/currentUser.decorator';
import { JwtAuthGuard } from './guards/jwt.guard';
import { UserService } from './user.service';

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
}
