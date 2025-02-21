import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerOptionsDefault: MulterOptions = {
  storage: diskStorage({
    destination: join(__dirname, '../../uploads'),
    filename: (req, file, cb) => {
      const filename = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, filename);
    },
  }),
};

export const multerOptionsProtocols: MulterOptions = {
  storage: diskStorage({
    destination: join(__dirname, '../../uploads/protocols'),
    filename: (req, file, cb) => {
      const filename = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, filename);
    },
  }),
}