import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RoleModule } from 'src/role/role.module';
import { PassportModule } from '@nestjs/passport';
import { FileModule } from 'src/file/file.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [RoleModule, PassportModule, FileModule],
})
export class UserModule {}
