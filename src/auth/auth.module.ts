import { UserModule } from '../user/user.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ATStrategy, RTStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { TokenService } from './token.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ATStrategy, RTStrategy, TokenService],
  imports: [UserModule, MailModule, JwtModule.register({}), PassportModule],
})
export class AuthModule {}
