import { Module } from '@nestjs/common';
import { path } from 'app-root-path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RoleModule } from './role/role.module';
import { MailModule } from './mail/mail.module';
import { FileModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CategoriesModule } from './categories/categories.module';
import { CommentsService } from './comments/comments.service';
import { CommentsController } from './comments/comments.controller';
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';

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
    CategoriesModule,
    CommentsModule,
    PostsModule,
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class AppModule {}
