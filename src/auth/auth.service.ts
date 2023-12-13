import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { USER_IN_USE_ERROR } from '../users/users.constants';
import { PASSWORD_DO_NOT_MATCH_ERROR } from './auth.constants';
import { SigninDto, SignupDto } from './dto';
import { MailService } from 'src/mail/mail.service';
import { CookieOptions, Tokens } from './types';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private mailService: MailService,
    private tokenService: TokenService,
  ) {}
  async signup(dto: SignupDto) {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException(PASSWORD_DO_NOT_MATCH_ERROR);
    }
    const isUserExists = await this.userService.findUser(dto.email);
    if (isUserExists) {
      throw new BadRequestException(USER_IN_USE_ERROR);
    }
    const { user, randomSixDigitNumber } =
      await this.userService.createUser(dto);
    try {
      this.mailService.sendActivationCode(user.email, randomSixDigitNumber);
      return {
        status: 'success',
        message: 'Code has been sent to your email!',
      };
    } catch (e) {
      await this.prisma.user.delete({ where: { email: user.email } });
      throw new HttpException(
        'There was an error sending the email. Try again later!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async reSendActivationCode(email: string) {
    const randomSixDigitNumber = Math.floor(Math.random() * 900000) + 100000;
    const numberAsString = randomSixDigitNumber.toString();
    const hashedActivationCode = crypto
      .createHash('sha256')
      .update(numberAsString)
      .digest('hex');
    const activationCodeExpires: Date = new Date();
    activationCodeExpires.setMinutes(activationCodeExpires.getMinutes() + 1);
    await this.prisma.user.update({
      where: { email },
      data: {
        activationCode: hashedActivationCode,
        activationCodeExpires,
      },
    });

    try {
      this.mailService.sendActivationCode(email, randomSixDigitNumber);
    } catch (e) {
      throw new HttpException(
        'There was an error sending the email. Try again later!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async activate(activationCode: string): Promise<Tokens> {
    const numberAsString = activationCode.toString();
    const hashedActivationCode = crypto
      .createHash('sha256')
      .update(numberAsString)
      .digest('hex');
    const user = await this.prisma.user.findFirst({
      where: {
        activationCode: hashedActivationCode,
        activationCodeExpires: {
          gt: new Date(),
        },
      },
    });
    if (!user) {
      throw new BadRequestException('Incorrect code');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isActivated: true,
      },
    });
    const tokens = await this.tokenService.generateTokens({
      email: user.email,
      sub: user.id,
    });
    await this.tokenService.saveToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async signin(dto: SigninDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: this.userService.getUserSelectFields(true),
    });
    if (!existingUser) {
      throw new BadRequestException('Email or password incorrect');
    }
    const isPassCorrect = await bcrypt.compare(
      dto.password,
      existingUser.password,
    );
    if (!isPassCorrect) {
      throw new BadRequestException('Email or password incorrect');
    }
    if (!existingUser.isActivated) {
      await this.reSendActivationCode(existingUser.email);
      return {
        status: 'success',
        message: 'Code has been sent to your email!',
      };
    }
    const tokens = await this.tokenService.generateTokens({
      email: existingUser.email,
      sub: existingUser.id,
    });
    await this.tokenService.saveToken(existingUser.id, tokens.refreshToken);
    return { tokens, existingUser };
  }

  async signout(refreshToken: string) {
    return this.tokenService.removeToken(refreshToken);
  }

  cookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions: CookieOptions = {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict',
    };
    if (isProduction) {
      cookieOptions.secure = true;
    }
    return cookieOptions;
  }
}
