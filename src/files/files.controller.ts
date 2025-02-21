import { Controller, Get, Param, ParseFilePipe, ParseIntPipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptionsDefault } from 'src/config/multer.config';
import { CustomMaxFileSizeValidator } from 'src/common/validators/max-file-size.validator';
import { LogsService } from 'src/modules/logs/logs.service';
import { LogTypesIds } from 'src/modules/logs/entities/log-type.dto';
import { LogTargetsIds } from 'src/modules/logs/entities/log-target';
import { rsp201, rsp404, rspOk } from 'src/common/helpers/http-responses';
import { getUrlStaticFile } from 'src/common/helpers/file';
import { CustomFileTypeValidator } from 'src/common/validators/file-type.validator';
import * as fileHelper from 'src/common/helpers/file';
import { CustomFileExtensionValidator } from 'src/common/validators/file-extension.validator';

@Controller('files')
export class FilesController {
  constructor(
    private filesService: FilesService,
    private logsService: LogsService,
  ) {}
  
  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) fileId: number,
    @Res() res: Response,
  ) {
    const data = await this.filesService.findOne(fileId);
    if (!data) return rsp404(res);
  
    return rspOk(res, data);
  }

  @Get(':id/download')
  async downloadUserFile(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) fileId: number,
    @Res() res: Response,
  ) {
    const file = await this.filesService.findOne(fileId);
    if (!file) return rsp404(res);

    const filePath = fileHelper.getLocalUriStaticFile(file.path);

    if (!fileHelper.existsFile(filePath)) return rsp404(res);

    res.download(filePath, file.name);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptionsDefault))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new CustomMaxFileSizeValidator({ maxSize: 2048 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const newId = await this.filesService.create({ path: file.filename, name: file.originalname });

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: newId,
      target_row_label: file.originalname,
      log_target_id: LogTargetsIds.FILE,
    });

    return rsp201(res, {
      id: newId,
      url: getUrlStaticFile(file.filename),
    });
  }

  @Post('pdf-jpeg-png')
  @UseInterceptors(FileInterceptor('file', multerOptionsDefault))
  async uploadPDFJPEGPNG(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new CustomMaxFileSizeValidator({ maxSize: 2048 * 1024 }),
          new CustomFileTypeValidator({
            fileType: /(pdf|jpeg|png|jpg)/,
            message: 'Archivo debe ser de tipo pdf, jpeg, png ó jpg',
          }),
          new CustomFileExtensionValidator({
            extensions: /(.pdf|.jpeg|.png|.jpg)/,
            message: 'Archivo debe ser de extensión .pdf, .jpeg, .png ó .jpg',
          })
        ],
      }),
    )
    file: Express.Multer.File,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const newId = await this.filesService.create({ path: file.filename, name: file.originalname });

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: newId,
      target_row_label: file.originalname,
      log_target_id: LogTargetsIds.FILE,
    });

    return rsp201(res, {
      id: newId,
      url: getUrlStaticFile(file.filename),
    });
  }
}
