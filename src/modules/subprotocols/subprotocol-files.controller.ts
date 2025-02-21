import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Res } from '@nestjs/common';
import { LogsService } from '../logs/logs.service';
import { SubProtocolFilesService } from './subprotocol-files.service';
import { ReqQuery } from './dto/req-query-subprotocol-file.dto';
import { Response } from 'express';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { CreateSubProtocolFileDto } from './dto/create-subprotocol-file.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogTargetsIds } from '../logs/entities/log-target';
import { UpdateSubProtocolFileDto } from './dto/update-subprotocol-file.dto';

@Controller('protocols/:protocolId/subprotocols/:subprotocolId/subprotocol-files')
export class SubProtocolFilesController {
  constructor(
    private logsService: LogsService,
    private subProtocolFilesService: SubProtocolFilesService,
  ) {}

  @Get()
  async findAll(
    @Query() query: ReqQuery,
    @Param('protocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolId: number,
    @Param('subprotocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) subprotocolId: number,
    @Res() res: Response,
  ) {
    query.subprotocol_id = subprotocolId;
    const result = await this.subProtocolFilesService.findAll(query);
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) subprotocolFileId: number,
    @Param('subprotocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) subprotocolId: number,
    @Res() res: Response,
  ) {
    const data = await this.subProtocolFilesService.findOne(subprotocolFileId);
    if (!data) return rsp404(res);

    return rspOk(res, data);
  }

  @Post()
  async create(
    @Body() createSubProtocolFileDto: CreateSubProtocolFileDto,
    @Param('subprotocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) subprotocolId: number,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const newSubprotocolFile = await this.subProtocolFilesService.create({
      ...createSubProtocolFileDto,
      subprotocol_id: subprotocolId,
    });
    if (!newSubprotocolFile) return rsp404(res);

    const newSubprotocolFileId = newSubprotocolFile.id;

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: newSubprotocolFileId,
      target_row_label: newSubprotocolFileId.toString(),
      log_target_id: LogTargetsIds.SUBPROTOCOL_FILE,
      data: JSON.stringify(newSubprotocolFile),
    });

    return rsp201(res, newSubprotocolFileId);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) subprotocolFileId: number,
    @Param('protocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolId: number,
    @Param('subprotocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) subprotocolId: number,
    @Body()
    updateSubProtocolFileDto: UpdateSubProtocolFileDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const subProtocolFile = await this.subProtocolFilesService.findOne(subprotocolFileId);
    if (!subProtocolFile) return rsp404(res);

    updateSubProtocolFileDto.subprotocol_id = subprotocolId;

    const dataChanged = this.logsService.getDataChangedJson(subProtocolFile, updateSubProtocolFileDto);
    await this.subProtocolFilesService.update(subprotocolFileId, updateSubProtocolFileDto);

    if (dataChanged) {
      const { perms, ...result } = JSON.parse(dataChanged);

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: subProtocolFile.id,
        target_row_label: subProtocolFile.id.toString(),
        log_target_id: LogTargetsIds.SUBPROTOCOL_FILE,
        data: JSON.stringify({ ...result }),
      });
    }

    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) subprotocolFileId: number,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const subProtocolFile = await this.subProtocolFilesService.findOne(subprotocolFileId);

    if (!subProtocolFile) return rsp404(res);

    await this.subProtocolFilesService.remove(subprotocolFileId);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: subProtocolFile.id,
      target_row_label: subProtocolFile.id.toString(),
      log_target_id: LogTargetsIds.SUBPROTOCOL_FILE,
    });

    return rspOkDeleted(res);
  }
}
