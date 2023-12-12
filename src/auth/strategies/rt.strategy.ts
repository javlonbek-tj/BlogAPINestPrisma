import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types';
import { USER_RECENTLY_CHANGED_PASSWORD_ERROR } from '../auth.constants';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RTStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('RT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.cookies.jwt;
    if (!refreshToken) {
      throw new UnauthorizedException('RefreshToken not Found');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { passwordChangedAt: true },
    });
    if (this.changedPasswordAfter(payload.iat, user.passwordChangedAt)) {
      throw new UnauthorizedException(USER_RECENTLY_CHANGED_PASSWORD_ERROR);
    }
    return { ...payload, refreshToken };
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
