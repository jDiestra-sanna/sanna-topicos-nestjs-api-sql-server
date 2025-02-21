import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { DiagnosesService } from './diagnoses.service';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { Response } from 'express';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { ReqQuery } from './dto/req-query.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { LogsService } from '../logs/logs.service';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogTargetsIds } from '../logs/entities/log-target';
import { EnabledDisabledDto } from 'src/common/dto/enabled-disabled.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';

@Controller('diagnoses')
export class DiagnosesController {
  constructor(
    private diagnosesService: DiagnosesService,
    private logsService: LogsService
  ) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.diagnosesService.findAll(query)
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page)
  }

  @Get(':id')
  async findOne(@Param() params: ParamIdDto, @Res() res: Response) {
    const data = await this.diagnosesService.findOne(params.id);
    if (!data) return rsp404(res);
    return rspOk(res, data);
  }

  @Post()
  async create(@Body() createDiagnosisDto: CreateDiagnosisDto, @Res() res: Response, @AuthUser() authUser: User) {
    const diagnosis = await this.diagnosesService.create(createDiagnosisDto);
    
    if (!diagnosis) return rsp404(res);
    const diagnosisId = diagnosis.id

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: diagnosisId,
      target_row_label: createDiagnosisDto.name,
      log_target_id: LogTargetsIds.DIAGNOSIS,
      data: JSON.stringify(diagnosis)
    })

    return rsp201(res, diagnosisId);
  }

  @Patch(':id')
  async update(@Param() params: ParamIdDto, @Body() updateDiagnosisDto: UpdateDiagnosisDto, @Res() res: Response, @AuthUser() authUser: User) {
    const diagnosis = await this.diagnosesService.findOne(params.id);
    if (!diagnosis) return rsp404(res);

    if(updateDiagnosisDto.code) {
      const existsCode = await this.diagnosesService.diagnosisExistsByCode(updateDiagnosisDto.code, diagnosis.id)
      if(existsCode) throw new BadRequestException('Código de diagnóstico ya existe')
    }

    const dataChanged = this.logsService.getDataChangedJson(diagnosis, updateDiagnosisDto)

    if(dataChanged) {
      await this.diagnosesService.update(params.id, updateDiagnosisDto)

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: diagnosis.id,
        target_row_label: diagnosis.name,
        log_target_id: LogTargetsIds.DIAGNOSIS,
        data: dataChanged
      })
    }
    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(@Param() params: ParamIdDto, @Res() res: Response, @AuthUser() authUser: User) {
    const diagnosis = await this.diagnosesService.findOne(params.id);
    if (!diagnosis) return rsp404(res);
    await this.diagnosesService.remove(params.id);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: diagnosis.id,
      target_row_label: diagnosis.name,
      log_target_id: LogTargetsIds.DIAGNOSIS
    })

    return rspOkDeleted(res);
  }

  @Patch('/:id/state')
  async updateState(
    @Param() params: ParamIdDto,
    @Body() updateStateDto: EnabledDisabledDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const diagnosis = await this.diagnosesService.findOne(params.id);

    if (!diagnosis) return rsp404(res);

    if (updateStateDto.state === BaseEntityState.ENABLED) {
      await this.diagnosesService.enable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.ENABLED,
        user_id: authUser.id,
        target_row_id: diagnosis.id,
        target_row_label: diagnosis.name,
        log_target_id: LogTargetsIds.DIAGNOSIS,
      });
    }

    if (updateStateDto.state === BaseEntityState.DISABLED) {
      await this.diagnosesService.disable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.DISABLED,
        user_id: authUser.id,
        target_row_id: diagnosis.id,
        target_row_label: diagnosis.name,
        log_target_id: LogTargetsIds.DIAGNOSIS,
      });
    }
    return rspOk(res);
  }
}
