import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { EnabledDisabledDto } from 'src/common/dto/enabled-disabled.dto';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { getUrlStaticFile } from 'src/common/helpers/file';
import {
  paginatedRspOk,
  rsp201,
  rsp404,
  rspOk,
  rspOkDeleted,
  rspOkUpdated,
} from 'src/common/helpers/http-responses';
import { LogTargetsIds } from '../logs/entities/log-target';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogsService } from '../logs/logs.service';
import { User } from '../users/entities/user.entity';
import { ClientsService } from './clients.service';
import { CreateClientpDto } from './dto/create-client.dto';
import { ReqQuery } from './dto/req-query.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(
    private clientsService: ClientsService,
    private logsService: LogsService
  ) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.clientsService.findAll(query);

    result.items = result.items.map(item => {
      item.pic = getUrlStaticFile(item.pic)
      return item;
    })

    return paginatedRspOk(
      res,
      result.items,
      result.total,
      result.limit,
      result.page,
    );
  }

  @Get(':id')
  async findOne(@Param() params: ParamIdDto, @Res() res: Response) {
    const data = await this.clientsService.findOne(params.id);

    data.pic = getUrlStaticFile(data.pic)

    if (!data) return rsp404(res);

    return rspOk(res, data);
  }

  @Post()
  async create(@Body() createClientDto: CreateClientpDto, @Res() res: Response, @AuthUser() authUser: User) {
    const newClient = await this.clientsService.create(createClientDto);
    const newId = newClient.id

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: newId,
      target_row_label: createClientDto.name,
      log_target_id: LogTargetsIds.CLIENT,
      data: JSON.stringify(newClient)
    })

    return rsp201(res, newId);
  }

  @Patch(':id')
  async update(
    @Param() params: ParamIdDto,
    @Body() updateClientDto: UpdateClientDto,
    @Res() res: Response,
    @AuthUser() authUser: User
  ) {
    const client = await this.clientsService.findOne(params.id);

    if (!client) return rsp404(res);

    if (updateClientDto.pic && client.pic && updateClientDto.pic.includes(client.pic)) {
      delete updateClientDto.pic;
    }

    const dataChanged = this.logsService.getDataChangedJson(client, updateClientDto);

    if (dataChanged) {
      await this.clientsService.update(params.id, updateClientDto);

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: client.id,
        target_row_label: client.name,
        log_target_id: LogTargetsIds.CLIENT,
        data: dataChanged
      })
    }

    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(@Param() params: ParamIdDto, @Res() res: Response, @AuthUser() authUser: User) {
    const client = await this.clientsService.findOne(params.id);

    if (!client) return rsp404(res);

    await this.clientsService.remove(params.id);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: client.id,
      target_row_label: client.name,
      log_target_id: LogTargetsIds.CLIENT
    })

    return rspOkDeleted(res);
  }

  @Patch('/:id/state')
  async updateState(
    @Param() params: ParamIdDto,
    @Body() updateStateDto: EnabledDisabledDto,
    @Res() res: Response,
    @AuthUser() authUser: User
  ) {
    const client = await this.clientsService.findOne(params.id);

    if (!client) return rsp404(res);

    if (updateStateDto.state === BaseEntityState.ENABLED) {
      await this.clientsService.enable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.ENABLED,
        user_id: authUser.id,
        target_row_id: client.id,
        target_row_label: client.name,
        log_target_id: LogTargetsIds.CLIENT
      })
    }

    if (updateStateDto.state === BaseEntityState.DISABLED) {
      await this.clientsService.disable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.DISABLED,
        user_id: authUser.id,
        target_row_id: client.id,
        target_row_label: client.name,
        log_target_id: LogTargetsIds.CLIENT
      })
    }

    return rspOk(res);
  }
}
