import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtPayload, Tokens } from './types';
import { ConfigService } from '@nestjs/config';
import { Token } from '@prisma/client';

@Injectable()
export class TokenService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async generateTokens(payload: Omit<JwtPayload, 'iat'>): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('AT_SECRET'),
      expiresIn: this.config.get<string>('AT_EXPIRATION_DATE'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('RT_SECRET'),
      expiresIn: this.config.get<string>('RT_EXPIRATION_DATE'),
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(userId: string, refreshToken: string): Promise<Token> {
    const hashedRToken = await bcrypt.hash(refreshToken, 10);
    const tokenData = await this.prisma.token.findUnique({
      where: { userId },
    });
    if (tokenData) {
      const updatedTokenData = await this.prisma.token.update({
        where: { userId },
        data: {
          refreshToken: hashedRToken,
        },
      });
      return updatedTokenData;
    }
    const token = await this.prisma.token.create({
      data: {
        userId,
        refreshToken: hashedRToken,
      },
    });
    return token;
  }

  async findToken(refreshToken: string): Promise<Token> {
    return this.prisma.token.findFirst({ where: { refreshToken } });
  }

  async removeToken(refereshToken: string): Promise<void> {
    const tokenData = await this.findToken(refereshToken);
    if (tokenData) {
      await this.prisma.token.delete({ where: { id: tokenData.id } });
    }
  }
}
