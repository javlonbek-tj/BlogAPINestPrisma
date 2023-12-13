import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { UserModule } from 'src/users/users.module';
import { FileModule } from 'src/files/files.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [FileModule, UserModule],
})
export class PostsModule {}
