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
import { LogsService } from '../logs/logs.service';
import { SubProtocolsService } from './subprotocols.service';
import { ReqQuery } from './dto/req-query.dto';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { Response } from 'express';
import { CreateSubProtocolDto } from './dto/create-subprotocol.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogTargetsIds } from '../logs/entities/log-target';
import { UpdateSubProtocolDto } from './dto/update-subprotocol.dto';
import { EnabledDisabledDto } from 'src/common/dto/enabled-disabled.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { ProtocolsService } from '../protocols/protocols.service';

@Controller('protocols/:protocolId/subprotocols')
export class SubProtocolsController {
  constructor(
    private logsService: LogsService,
    private subProtocolsService: SubProtocolsService,
    private protocolsService: ProtocolsService,
  ) {}

  @Get()
  async findAll(
    @Param('protocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolId: number,
    @Query() query: ReqQuery,
    @Res() res: Response,
  ) {
    const result = await this.subProtocolsService.findAll({ ...query, protocol_id: protocolId });
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }

  @Get(':id')
  async findOne(
    @Param('protocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolId: number,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Res() res: Response,
  ) {
    const protocol = await this.protocolsService.findOne(protocolId);
    if (!protocol) throw new BadRequestException('Protocolo no existe');

    const data = await this.subProtocolsService.findOne(id);
    if (!data) return rsp404(res);
    return rspOk(res, data);
  }

  @Post()
  async create(
    @Param('protocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolId: number,
    @Body() createSubProtocolDto: CreateSubProtocolDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const newSubprotocol = await this.subProtocolsService.create({ ...createSubProtocolDto, protocol_id: protocolId });
    if (!newSubprotocol) return rsp404(res);

    const newSubprotocolId = newSubprotocol.id;

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: newSubprotocolId,
      target_row_label: createSubProtocolDto.title,
      log_target_id: LogTargetsIds.SUBPROTOCOL,
      data: JSON.stringify(newSubprotocol),
    });

    return rsp201(res, newSubprotocolId);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Param('protocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolId: number,
    @Body() updateSubProtocolDto: UpdateSubProtocolDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const subProtocol = await this.subProtocolsService.findOne(id);
    if (!subProtocol) return rsp404(res);

    updateSubProtocolDto = { ...updateSubProtocolDto };

    const dataChanged = this.logsService.getDataChangedJson(subProtocol, updateSubProtocolDto);
    await this.subProtocolsService.update(id, updateSubProtocolDto);

    if (dataChanged) {
      const { perms, ...result } = JSON.parse(dataChanged);

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: subProtocol.id,
        target_row_label: subProtocol.title,
        log_target_id: LogTargetsIds.SUBPROTOCOL,
        data: JSON.stringify({ ...result }),
      });
    }

    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Param('protocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolId: number,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const protocol = await this.protocolsService.findOne(protocolId);
    if (!protocol) throw new BadRequestException('Protocolo no existe');

    const subProtocol = await this.subProtocolsService.findOne(id);

    if (!subProtocol) return rsp404(res);

    await this.subProtocolsService.remove(id);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: subProtocol.id,
      target_row_label: subProtocol.title,
      log_target_id: LogTargetsIds.SUBPROTOCOL,
    });

    return rspOkDeleted(res);
  }

  @Patch('/:id/state')
  async updateState(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Param('protocolId', new ParseIntPipe({ errorHttpStatusCode: 400 })) protocolId: number,
    @Body() updateStateDto: EnabledDisabledDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const protocol = await this.protocolsService.findOne(protocolId);
    if (!protocol) throw new BadRequestException('Protocolo no existe');

    const subProtocol = await this.subProtocolsService.findOne(id);

    if (!subProtocol) return rsp404(res);

    if (updateStateDto.state === BaseEntityState.ENABLED) {
      await this.subProtocolsService.enable(id);

      this.logsService.create({
        log_type_id: LogTypesIds.ENABLED,
        user_id: authUser.id,
        target_row_id: subProtocol.id,
        target_row_label: subProtocol.title,
        log_target_id: LogTargetsIds.SUBPROTOCOL,
      });
    }

    if (updateStateDto.state === BaseEntityState.DISABLED) {
      await this.subProtocolsService.disable(id);

      this.logsService.create({
        log_type_id: LogTypesIds.DISABLED,
        user_id: authUser.id,
        target_row_id: subProtocol.id,
        target_row_label: subProtocol.title,
        log_target_id: LogTargetsIds.SUBPROTOCOL,
      });
    }

    return rspOk(res);
  }
}
