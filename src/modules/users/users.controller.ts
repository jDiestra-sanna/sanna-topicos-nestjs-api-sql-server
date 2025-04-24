import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserCreationRequestDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { ReqQuery } from './dto/req-query.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { EnabledDisabledDto } from 'src/common/dto/enabled-disabled.dto';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { SessionsService } from '../sessions/sessions.service';
import { LogsService } from '../logs/logs.service';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from './entities/user.entity';
import { LogTargetsIds } from '../logs/entities/log-target';
import { UserTypeIds } from './entities/type-user.entity';
import { RoleIds } from '../roles/entities/role.entity';
import ExcelJSService from 'src/exceljs/exceljs.service';
import { ReqQueryExport } from './dto/req-query-export.dto';

@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private sessionsService: SessionsService,
    private logsService: LogsService,
    private excelJsService: ExcelJSService,
  ) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response, @AuthUser() authUser: User) {
    const result = await this.userService.findAll(query);

    const itemsFiltered = result.items.filter(item => !(authUser.role_id !== RoleIds.ROOT && item.id === RoleIds.ROOT));

    return paginatedRspOk(res, itemsFiltered, itemsFiltered.length, result.limit, result.page);
  }

  @Get('export')
  async exportAll(@Query() query: ReqQueryExport, @Res() res: Response) {
    const data = await this.userService.exportAll(query);

    const buffer = await this.excelJsService.setWorksheetName('reporte').setColumns([
      { header: 'ID', key: 'user_id' },
      { header: 'Nombre', key: 'user_name' },
      { header: 'Apellido Paterno', key: 'user_surname_first' },
      { header: 'Apellido Materno', key: 'user_surname_second' },
      { header: 'Email', key: 'user_email' },
      { header: 'Perfil', key: 'role_name' },
      { header: 'Tipo de documento', key: 'document_type_name' },
      { header: 'Número de documento', key: 'user_document_number' },
      { header: 'Teléfono', key: 'user_phone' },
      { header: 'Fecha de registro', key: 'user_date_created' },
      { header: 'Es Central', key: 'user_is_central' },
    ])
    .setData(data)
    .writeBuffer()

    res.header('Content-Disposition', 'attachment; filename="reporte_usuarios.xlsx"');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    return res.send(buffer)
  }


  @Get(':id')
  async findOne(@Param() params: ParamIdDto, @Res() res: Response) {
    const data = await this.userService.findOne(params.id);

    if (!data) return rsp404(res);

    delete data.pic;
    delete data.pic_file_id;
    delete data.document;
    delete data.surname;
    delete data.password;

    return rspOk(res, data);
  }

  @Post()
  async create(
    @Body() userCreationRequestDto: UserCreationRequestDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const user = await this.userService.create({ ...userCreationRequestDto, user_type_id: UserTypeIds.USER });

    const idUser = user.id;
    delete user.password;

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: idUser,
      target_row_label: userCreationRequestDto.name,
      log_target_id: LogTargetsIds.USER,
      data: JSON.stringify(user),
    });

    return rsp201(res, idUser);
  }

  @Patch(':id')
  async update(
    @Param() params: ParamIdDto,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const user = await this.userService.findOne(params.id);
    if (!user) return rsp404(res);

    if (updateUserDto.email) {
      const existsEmail = await this.userService.existsEmail(updateUserDto.email, user.id);
      if (existsEmail) throw new BadRequestException('Correo ingresado ya existe');
    }

    const dataChanged = this.logsService.getDataChangedJson(user, updateUserDto);

    if (dataChanged) {
      await this.userService.update(params.id, updateUserDto);

      let _dataChanged = JSON.parse(dataChanged);
      if (_dataChanged['password']) {
        _dataChanged['password']['old'] = 'old';
        _dataChanged['password']['new'] = 'new';
      }
      _dataChanged = JSON.stringify(_dataChanged);

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: user.id,
        target_row_label: user.name,
        log_target_id: LogTargetsIds.USER,
        data: _dataChanged,
      });
    }

    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(@Param() params: ParamIdDto, @Res() res: Response, @AuthUser() authUser: User) {
    const user = await this.userService.findOne(params.id);

    if (!user) return rsp404(res);

    if (user.role_id === RoleIds.ROOT) throw new ForbiddenException('No autorizado');

    await this.userService.remove(params.id);
    await this.sessionsService.removeManyByUserId(params.id);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: user.id,
      target_row_label: user.name,
      log_target_id: LogTargetsIds.USER,
    });

    return rspOkDeleted(res);
  }

  @Patch('/:id/state')
  async updateState(
    @Param() params: ParamIdDto,
    @Body() updateStateDto: EnabledDisabledDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const user = await this.userService.findOne(params.id);

    if (!user) return rsp404(res);

    if (updateStateDto.state === BaseEntityState.ENABLED) {
      await this.userService.enable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.ENABLED,
        user_id: authUser.id,
        target_row_id: user.id,
        target_row_label: user.name,
        log_target_id: LogTargetsIds.USER,
      });
    }

    if (updateStateDto.state === BaseEntityState.DISABLED) {
      await this.userService.disable(params.id);
      await this.sessionsService.removeManyByUserId(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.DISABLED,
        user_id: authUser.id,
        target_row_id: user.id,
        target_row_label: user.name,
        log_target_id: LogTargetsIds.USER,
      });
    }

    return rspOk(res);
  }
}
