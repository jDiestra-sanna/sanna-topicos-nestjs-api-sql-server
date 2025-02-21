import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProtocolFilesService } from './protocol-files.service';
import { Response } from 'express';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { LogsService } from '../logs/logs.service';
import { CreateProtocolFileDto } from './dto/create-protocol-file.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogTargetsIds } from '../logs/entities/log-target';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptionsDefault } from 'src/config/multer.config';
import { CustomMaxFileSizeValidator } from 'src/common/validators/max-file-size.validator';
import { CustomFileTypeValidator } from 'src/common/validators/file-type.validator';
import { getUrlStaticFile } from 'src/common/helpers/file';
import { FilesService } from 'src/files/files.service';
import { ReqQuery } from './dto/req-query-protocol-files.dto';
import { UpdateProtocolFileDto } from './dto/update-protocol-file.dto';
import { CustomFileExtensionValidator } from 'src/common/validators/file-extension.validator';

@Controller('protocols/:protocolId/protocol-files')
export class ProtocolFilesController {
  constructor(
    private protocolFilesService: ProtocolFilesService,
    private logsService: LogsService,
    private filesService: FilesService,
  ) {}

  @Get()
  async findAll(
    @Query() query: ReqQuery,
    @Param('protocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolId: number,
    @Res() res: Response,
  ) {
    query.protocol_id = protocolId;
    const result = await this.protocolFilesService.findAll(query);
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolFileId: number,
    @Param('protocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolId: number,
    @Res() res: Response,
  ) {
    const data = await this.protocolFilesService.findOne(protocolFileId);
    if (!data) return rsp404(res);

    return rspOk(res, data);
  }

  @Post()
  async create(
    @Body() createProtocolFileDto: CreateProtocolFileDto,
    @Param('protocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolId: number,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const newProtocolFile = await this.protocolFilesService.create({
      ...createProtocolFileDto,
      protocol_id: protocolId,
    });
    if (!newProtocolFile) return rsp404(res);

    const newProtocolFileId = newProtocolFile.id;

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: newProtocolFileId,
      target_row_label: newProtocolFileId.toString(),
      log_target_id: LogTargetsIds.PROTOCOL_FILE,
      data: JSON.stringify(newProtocolFile),
    });

    return rsp201(res, newProtocolFileId);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolFileId: number,
    @Param('protocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolId: number,
    @Body() updateProtocolFileDto: UpdateProtocolFileDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const protocolFile = await this.protocolFilesService.findOne(protocolFileId);
    if (!protocolFile) return rsp404(res);

    updateProtocolFileDto.protocol_id = protocolId;

    const dataChanged = this.logsService.getDataChangedJson(protocolFile, updateProtocolFileDto);
    await this.protocolFilesService.update(protocolFileId, updateProtocolFileDto);

    if (dataChanged) {
      const { perms, ...result } = JSON.parse(dataChanged);

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: protocolFile.id,
        target_row_label: protocolFile.id.toString(),
        log_target_id: LogTargetsIds.PROTOCOL_FILE,
        data: JSON.stringify({ ...result }),
      });
    }

    return rspOkUpdated(res);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptionsDefault))
  async uploadFile(
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
            message: 'Archivo debe tener la extensión .pdf, .jpeg, .png ó .jpg',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const fileId = await this.filesService.create({
      name: file.originalname,
      path: file.filename,
    });

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: fileId,
      target_row_label: file.originalname,
      log_target_id: LogTargetsIds.FILE,
    });

    return rsp201(res, {
      id: fileId,
      url: getUrlStaticFile(file.filename),
    });
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolFileId: number,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const protocolFile = await this.protocolFilesService.findOne(protocolFileId);

    if (!protocolFile) return rsp404(res);

    await this.protocolFilesService.remove(protocolFileId);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: protocolFile.id,
      target_row_label: protocolFile.id.toString(),
      log_target_id: LogTargetsIds.PROTOCOL_FILE,
    });

    return rspOkDeleted(res);
  }
}
