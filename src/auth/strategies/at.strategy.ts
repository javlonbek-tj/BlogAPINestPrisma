import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types';
import { PrismaService } from 'src/prisma/prisma.service';
import { USER_RECENTLY_CHANGED_PASSWORD_ERROR } from '../auth.constants';

@Injectable()
export class ATStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('AT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { passwordChangedAt: true },
    });
    if (this.changedPasswordAfter(payload.iat, user.passwordChangedAt)) {
      throw new UnauthorizedException(USER_RECENTLY_CHANGED_PASSWORD_ERROR);
    }
    return payload;
  }

  changedPasswordAfter(
    JWTTimestamp: number,
    passwordChangedAt: Date | null,
  ): boolean {
    if (passwordChangedAt) {
      const changedTimestamp = passwordChangedAt.getTime() / 1000;
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  }
}
