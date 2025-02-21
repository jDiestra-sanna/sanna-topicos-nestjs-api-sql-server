import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { LogTargetsIds } from '../logs/entities/log-target';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogsService } from '../logs/logs.service';
import { UserFileCreationRequestDto } from './dto/create-user-file.dto';
import { ReqQueryUserFile } from './dto/req-query-user-file.dto';
import { UpdateUserFileDto } from './dto/update-user-file.dto';
import { User } from './entities/user.entity';
import { UserFilesService } from './user-files.services';
import { UsersService } from './users.service';
import { getUrlStaticFile } from 'src/common/helpers/file';

@Controller('users/:userId/files')
export class UserFilesController {
  constructor(
    private usersService: UsersService,
    private userFilesService: UserFilesService,
    private logsService: LogsService,
  ) {}

  @Get()
  async findAll(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
    @Query() query: ReqQueryUserFile,
    @Res() res: Response,
  ) {
    const result = await this.userFilesService.findAll({ ...query, user_id: userId });

    const items = result.items.map(item => {
      item.file.url = getUrlStaticFile(item.file.path);
      return item;
    });

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get(':id')
  async findOne(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Res() res: Response,
  ) {
    const data = await this.userFilesService.findOne(id);
    if (!data) return rsp404(res);

    const is = await this.userFilesService.isFileOfUser(id, userId);
    if (!is) throw new BadRequestException('Id de archivo no pertenece a id de usuario');

    return rspOk(res, data);
  }

  @Post()
  async create(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
    @Body() userFileCreationRequestDto: UserFileCreationRequestDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new BadRequestException('Id de usuario no existe');

    const userFileId = await this.userFilesService.create({ ...userFileCreationRequestDto, user_id: userId });

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: userFileId,
      target_row_label: userFileId.toString(),
      log_target_id: LogTargetsIds.USER_FILE,
    });

    return rsp201(res, userFileId);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
    @Body() updateUserFileDto: UpdateUserFileDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const userFile = await this.userFilesService.findOne(id);
    if (!userFile) return rsp404(res);

    const is = await this.userFilesService.isFileOfUser(id, userId);
    if (!is) throw new BadRequestException('Id de archivo no pertenece a id de usuario');

    const dataChanged = this.logsService.getDataChangedJson(userFile, updateUserFileDto);

    if (dataChanged) {
      await this.userFilesService.update(id, updateUserFileDto);

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: userFile.id,
        target_row_label: userFile.id.toString(),
        log_target_id: LogTargetsIds.USER_FILE,
        data: dataChanged,
      });
    }

    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const userFile = await this.userFilesService.findOne(id);
    if (!userFile) return rsp404(res);

    const is = await this.userFilesService.isFileOfUser(id, userId);
    if (!is) throw new BadRequestException('Id de archivo no pertenece a id de usuario');

    await this.userFilesService.remove(id);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: userFile.id,
      target_row_label: userFile.id.toString(),
      log_target_id: LogTargetsIds.USER_FILE,
    });

    return rspOkDeleted(res);
  }
}
