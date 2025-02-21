import { Controller, ParseFilePipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AppService } from './app.service';
import { rspOk } from './common/helpers/http-responses';
import { CustomFileTypeValidator } from './common/validators/file-type.validator';
import { CustomMaxFileSizeValidator } from './common/validators/max-file-size.validator';
import { multerOptionsDefault } from './config/multer.config';
import { CustomFileExtensionValidator } from './common/validators/file-extension.validator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('static-images')
  @UseInterceptors(FileInterceptor('file', multerOptionsDefault))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new CustomMaxFileSizeValidator({ maxSize: 1024 * 1024 }),
          new CustomFileTypeValidator({
            fileType: /(jpeg|ico|png)/,
            message: 'Imagen debe ser del tipo jpg, ico o png',
          }),
          new CustomFileExtensionValidator({
            extensions: /(.jpeg|.ico|.png)/,
            message: 'Imagen debe ser la extensión .jpg, .ico ó .png',
          })
        ],
      }),
    )
    file: Express.Multer.File,
    @Res() res: Response,
  ) {
    return rspOk(res, file.filename);
  }
}
