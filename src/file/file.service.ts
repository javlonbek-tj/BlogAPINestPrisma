import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as uuid from 'uuid';
import { format } from 'date-fns';
import { path } from 'app-root-path';
import { ensureDir } from 'fs-extra';
import { promisify } from 'util';

@Injectable()
export class FileService {
  async createFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileName = `${uuid.v4()}.${file.originalname}`;
      const dateFolder = format(new Date(), 'yyyy-MM-dd');
      const filePath = `${path}/uploads/${dateFolder}`;
      await ensureDir(filePath);
      fs.writeFileSync(`${filePath}/${fileName}`, file.buffer);
      return fileName;
    } catch (e) {
      throw new HttpException(
        'Error in uploading file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const unlinkAsync = promisify(fs.unlink);
      await unlinkAsync(filePath);
    } catch (e) {
      throw new HttpException(
        'Some went wrong. Try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
