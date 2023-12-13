import { Module } from '@nestjs/common';
import { FileService } from './files';

@Module({
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
