import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import {
  paginatedRspOk,
  rsp201,
  rsp404,
  rspOk,
  rspOkDeleted,
  rspOkUpdated,
} from 'src/common/helpers/http-responses';
import { ReqQuery } from './dto/req-query.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { EnabledDisabledDto } from 'src/common/dto/enabled-disabled.dto';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { LogsService } from '../logs/logs.service';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogTargetsIds } from '../logs/entities/log-target';
import { getUrlStaticFile } from 'src/common/helpers/file';

@Controller('groups')
export class GroupsController {
  constructor(
    private groupsService: GroupsService,
    private logsService: LogsService
  ) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.groupsService.findAll(query);

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
    const data = await this.groupsService.findOne(params.id);

    data.pic = getUrlStaticFile(data.pic)

    if (!data) return rsp404(res);

    return rspOk(res, data);
  }

  @Post()
  async create(@Body() createGroupDto: CreateGroupDto, @Res() res: Response, @AuthUser() authUser: User) {
    const newGroup = await this.groupsService.create(createGroupDto);
    const newId = newGroup.id

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: newId,
      target_row_label: createGroupDto.name,
      log_target_id: LogTargetsIds.GROUP,
      data: JSON.stringify(newGroup)
    })

    return rsp201(res, newId);
  }

  @Patch(':id')
  async update(
    @Param() params: ParamIdDto,
    @Body() updateGroupDto: UpdateGroupDto,
    @Res() res: Response,
    @AuthUser() authUser: User
  ) {
    const group = await this.groupsService.findOne(params.id);

    if (!group) return rsp404(res);

    if (updateGroupDto.pic && group.pic && updateGroupDto.pic.includes(group.pic)) {
      delete updateGroupDto.pic;
    }
    
    const dataChanged = this.logsService.getDataChangedJson(group, updateGroupDto);

    if (dataChanged) {
      await this.groupsService.update(params.id, updateGroupDto);

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: group.id,
        target_row_label: group.name,
        log_target_id: LogTargetsIds.GROUP,
        data: dataChanged
      })
    }

    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(@Param() params: ParamIdDto, @Res() res: Response, @AuthUser() authUser: User) {
    const group = await this.groupsService.findOne(params.id);

    if (!group) return rsp404(res);

    await this.groupsService.remove(params.id);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: group.id,
      target_row_label: group.name,
      log_target_id: LogTargetsIds.GROUP
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
    const group = await this.groupsService.findOne(params.id);

    if (!group) return rsp404(res);

    if (updateStateDto.state === BaseEntityState.ENABLED) {
      await this.groupsService.enable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.ENABLED,
        user_id: authUser.id,
        target_row_id: group.id,
        target_row_label: group.name,
        log_target_id: LogTargetsIds.GROUP
      })
    }

    if (updateStateDto.state === BaseEntityState.DISABLED) {
      await this.groupsService.disable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.DISABLED,
        user_id: authUser.id,
        target_row_id: group.id,
        target_row_label: group.name,
        log_target_id: LogTargetsIds.GROUP
      })
    }

    return rspOk(res);
  }
}
