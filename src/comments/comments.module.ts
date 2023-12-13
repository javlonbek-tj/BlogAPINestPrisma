import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { UserModule } from 'src/users/users.module';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [UserModule],
})
export class CommentsModule {}
