import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ProtocolsService } from './protocols.service';
import { Response } from 'express';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { CreateProtocolDto } from './dto/create-protocol.dto';
import { UpdateProtocolDto } from './dto/update-protocol.dto';
import { EnabledDisabledDto } from 'src/common/dto/enabled-disabled.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { LogsService } from '../logs/logs.service';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogTargetsIds } from '../logs/entities/log-target';
import { ReqQuery } from './dto/req-query.dto';
import { ProtocolTypes } from './entities/protocol-type.entity';

@Controller('protocols')
export class ProtocolsController {
  constructor(
    private protocolsService: ProtocolsService,
    private logsService: LogsService,
  ) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response, @AuthUser() authUser: User) {
    const result = await this.protocolsService.findAll(query, authUser);
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }

  @Get(':id')
  async findOne(@Param() params: ParamIdDto, @Res() res: Response) {
    const data = await this.protocolsService.findOne(params.id);
    if (!data) return rsp404(res);
    return rspOk(res, data);
  }

  @Post()
  async create(@Body() createProtocolDto: CreateProtocolDto, @Res() res: Response, @AuthUser() authUser: User) {
    if (createProtocolDto.protocol_type_id == ProtocolTypes.PROTOCOL_CLIENT && !createProtocolDto.client_id)
      throw new BadRequestException('Cliente ID es obligatorio para Protocolo Cliente');

    if (createProtocolDto.protocol_type_id == ProtocolTypes.PROTOCOL_SANNA && createProtocolDto.client_id)
      throw new BadRequestException('El Protocolo Sanna no puede contener un Cliente')

    const newProtocol = await this.protocolsService.create(createProtocolDto);
    if (!newProtocol) return rsp404(res);

    const newProtocolId = newProtocol.id

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: newProtocolId,
      target_row_label: createProtocolDto.title,
      log_target_id: LogTargetsIds.PROTOCOL,
      data: JSON.stringify(newProtocol)
    });

    return rsp201(res, newProtocolId);
  }

  @Patch(':id')
  async update(
    @Param() params: ParamIdDto,
    @Body() updateProtocolDto: UpdateProtocolDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const protocol = await this.protocolsService.findOne(params.id);
    if (!protocol) return rsp404(res);

    if (updateProtocolDto.protocol_type_id == ProtocolTypes.PROTOCOL_CLIENT && !updateProtocolDto.client_id)
      throw new BadRequestException('Cliente ID es obligatorio para Protocolo Cliente');

    if (updateProtocolDto.protocol_type_id == ProtocolTypes.PROTOCOL_SANNA && updateProtocolDto.client_id)
      throw new BadRequestException('El Protocolo Sanna no puede contener un Cliente')

    const dataChanged = this.logsService.getDataChangedJson(protocol, updateProtocolDto);
    await this.protocolsService.update(params.id, updateProtocolDto);

    if (dataChanged) {
      const { perms, ...result } = JSON.parse(dataChanged);

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: protocol.id,
        target_row_label: protocol.title,
        log_target_id: LogTargetsIds.PROTOCOL,
        data: JSON.stringify({ ...result }),
      });
    }

    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(@Param() params: ParamIdDto, @Res() res: Response, @AuthUser() authUser: User) {
    const protocol = await this.protocolsService.findOne(params.id);

    if (!protocol) return rsp404(res);

    await this.protocolsService.remove(params.id);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: protocol.id,
      target_row_label: protocol.title,
      log_target_id: LogTargetsIds.PROTOCOL,
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
    const protocol = await this.protocolsService.findOne(params.id);

    if (!protocol) return rsp404(res);

    if (updateStateDto.state === BaseEntityState.ENABLED) {
      await this.protocolsService.enable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.ENABLED,
        user_id: authUser.id,
        target_row_id: protocol.id,
        target_row_label: protocol.title,
        log_target_id: LogTargetsIds.PROTOCOL,
      });
    }

    if (updateStateDto.state === BaseEntityState.DISABLED) {
      await this.protocolsService.disable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.DISABLED,
        user_id: authUser.id,
        target_row_id: protocol.id,
        target_row_label: protocol.title,
        log_target_id: LogTargetsIds.PROTOCOL,
      });
    }

    return rspOk(res);
  }
}
