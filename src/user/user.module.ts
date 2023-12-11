import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RoleModule } from 'src/role/role.module';
import { PassportModule } from '@nestjs/passport';
import { FileModule } from '../file/file.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [
    RoleModule,
    PassportModule,
    FileModule,
    forwardRef(() => AuthModule),
    MailModule,
  ],
})
export class UserModule {}
