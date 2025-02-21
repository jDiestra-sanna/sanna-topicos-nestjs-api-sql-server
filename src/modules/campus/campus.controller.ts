import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UseFilters } from '@nestjs/common';
import { Response } from 'express';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { EnabledDisabledDto } from 'src/common/dto/enabled-disabled.dto';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { getUrlStaticFile } from 'src/common/helpers/file';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { LogTargetsIds } from '../logs/entities/log-target';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogsService } from '../logs/logs.service';
import { User } from '../users/entities/user.entity';
import { ReqQuery } from './dto/req-query.dto';
import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { ValidationExceptionFilter } from 'src/common/filters/validation-exception.filter';
import { UnicityConflictExceptionFilter } from 'src/common/filters/unicity-conflict-exception.filter';

@Controller('campus')
export class CampusController {
  constructor(
    private campusService: CampusService,
    private logsService: LogsService,
  ) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.campusService.findAll(query);

    result.items = result.items.map(item => {
      item.pic = getUrlStaticFile(item.pic);
      return item;
    });

    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }

  @Get(':id')
  async findOne(@Param() params: ParamIdDto, @Res() res: Response) {
    const data = await this.campusService.findOne(params.id);

    data.pic = getUrlStaticFile(data.pic);

    if (!data) return rsp404(res);

    return rspOk(res, data);
  }

  @Post()
  @UseFilters(ValidationExceptionFilter)
  @UseFilters(UnicityConflictExceptionFilter)
  async create(@Body() createCampusDto: CreateCampusDto, @Res() res: Response, @AuthUser() authUser: User) {
    const newCampus = await this.campusService.create(createCampusDto);
    const newId = newCampus.id;

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: newId,
      target_row_label: createCampusDto.name,
      log_target_id: LogTargetsIds.CAMPUS,
      data: JSON.stringify(newCampus),
    });

    return rsp201(res, newId);
  }

  @Patch(':id')
  @UseFilters(ValidationExceptionFilter)
  @UseFilters(UnicityConflictExceptionFilter)
  async update(
    @Param() params: ParamIdDto,
    @Body() updateCampusDto: UpdateCampusDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const campus = await this.campusService.findOne(params.id);

    if (!campus) return rsp404(res);

    if (updateCampusDto.pic && campus.pic && updateCampusDto.pic.includes(campus.pic)) {
      delete updateCampusDto.pic;
    }

    const dataChanged = this.logsService.getDataChangedJson(campus, updateCampusDto);

    if (dataChanged) {
      await this.campusService.update(params.id, updateCampusDto);

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: campus.id,
        target_row_label: campus.name,
        log_target_id: LogTargetsIds.CAMPUS,
        data: dataChanged,
      });
    }

    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(@Param() params: ParamIdDto, @Res() res: Response, @AuthUser() authUser: User) {
    const campus = await this.campusService.findOne(params.id);

    if (!campus) return rsp404(res);

    await this.campusService.remove(params.id);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: campus.id,
      target_row_label: campus.name,
      log_target_id: LogTargetsIds.CAMPUS,
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
    const campus = await this.campusService.findOne(params.id);

    if (!campus) return rsp404(res);

    if (updateStateDto.state === BaseEntityState.ENABLED) {
      await this.campusService.enable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.ENABLED,
        user_id: authUser.id,
        target_row_id: campus.id,
        target_row_label: campus.name,
        log_target_id: LogTargetsIds.CAMPUS,
      });
    }

    if (updateStateDto.state === BaseEntityState.DISABLED) {
      await this.campusService.disable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.DISABLED,
        user_id: authUser.id,
        target_row_id: campus.id,
        target_row_label: campus.name,
        log_target_id: LogTargetsIds.CAMPUS,
      });
    }

    return rspOk(res);
  }
}
