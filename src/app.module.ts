import { Module } from '@nestjs/common';
import { path } from 'app-root-path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RoleModule } from './role/role.module';
import { MailModule } from './mail/mail.module';
import { FileModule } from './file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RoleModule,
    MailModule,
    FileModule,
    ServeStaticModule.forRoot({
      rootPath: `${path}/uploads`,
    }),
  ],
})
export class AppModule {}
