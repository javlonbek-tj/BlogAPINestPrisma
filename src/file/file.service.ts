import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as uuid from 'uuid';
import format from 'date-fns/format';
import path from 'app-root-path';

@Injectable()
export class FileService {
  async createFile(file): Promise<string> {
    try {
      const fileName = uuid.v4() + file.originalname;
      const dateFolder = format(new Date(), 'yyyy-MM-dd');
      const filePath = `${path}/uploads/${dateFolder}`;
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }
      fs.writeFileSync(`${filePath}/${fileName}`, file.buffer);
      return fileName;
    } catch (e) {
      throw new HttpException(
        'Error in uploading file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
