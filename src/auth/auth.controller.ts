import {
  Controller,
  Post,
  Body,
  Patch,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CodeDto, SigninDto, SignupDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Patch('/activate')
  async activate(@Body() dto: CodeDto, @Res() res: Response) {
    const tokens = await this.authService.activate(dto.activationCode);
    res.cookie(
      'jwt-refresh',
      tokens.refreshToken,
      this.authService.cookieOptions(),
    );
    return res.json(tokens);
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() dto: SigninDto, @Res() res: Response) {
    const result = await this.authService.signin(dto);
    if ('status' in result && result.status === 'success') {
      return res.status(HttpStatus.OK).json(result);
    }
    res.cookie(
      'jwt-refresh',
      result.tokens.refreshToken,
      this.authService.cookieOptions(),
    );
    return res.json(result.tokens);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.jwt;
    res.clearCookie('jwt');
    await this.authService.signout(refreshToken);
  }
}
