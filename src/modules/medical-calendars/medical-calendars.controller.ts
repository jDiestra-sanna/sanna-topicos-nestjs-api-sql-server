import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseFilters,
} from '@nestjs/common';
import { query, Response } from 'express';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { diffMilitaryTime } from 'src/common/helpers/date';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { LogTargetsIds } from '../logs/entities/log-target';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogsService } from '../logs/logs.service';
import { User } from '../users/entities/user.entity';
import { MedicalCalendarCreationRequestDto } from './dto/create-medical-calendar.dto';
import { ReqQuery, ReqQueryDelete, ReqQueryExport, ReqQueryForm } from './dto/req-query.dto';
import { MedicalCalendarUpdateRequestDto } from './dto/update-medical-calendar.dto';
import { MedicalCalendarsService } from './medical-calendars.service';
import { UnicityConflictExceptionFilter } from 'src/common/filters/unicity-conflict-exception.filter';
import ExcelJSService from 'src/exceljs/exceljs.service';

@Controller('medical-calendars')
export class MedicalCalendarsController {
  constructor(
    private medicalCalendars: MedicalCalendarsService,
    private logsService: LogsService,
    private excelJsService: ExcelJSService,
  ) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.medicalCalendars.findAll({ ...query });

    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }

  @Get('/export')
  async exportAll(@Query() query: ReqQueryExport, @Res() res: Response) {
    const data = await this.medicalCalendars.exportAll(query);

    const buffer = await this.excelJsService
      .setWorksheetName('reporte')
      .setColumns([
        { header: 'Nombre', key: 'user_name' },
        { header: 'Sede', key: 'campus_name' },
        { header: 'Dia', key: 'mcd_day' },
        { header: 'Hora de Entrada', key: 'mcd_entry_time', width: 10, style: { numFmt: 'HH:mm:ss' } },
        { header: 'Hora de salida', key: 'mcd_leaving_time', width: 10, style: { numFmt: 'HH:mm:ss' } },
      ])
      .setData(data)
      .writeBuffer();

    res.header('Content-Disposition', 'attachment; filename="reporte.xlsx"');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  }

  @Get('form')
  async findOneForm(@Query() query: ReqQueryForm, @Res() res: Response) {
    const data = await this.medicalCalendars.findOneForm(query);
    return rspOk(res, data);
  }

  @Get('form/export')
  async exportOneForm(@Query() query: ReqQueryForm, @Res() res: Response) {
    const data = await this.medicalCalendars.exportOneForm(query);

    const buffer = await this.excelJsService
      .setWorksheetName('reporte')
      .setColumns([
        { header: 'Nombre', key: 'user_name' },
        { header: 'Sede', key: 'campus_name' },
        { header: 'Dia', key: 'mcd_day' },
        { header: 'Hora de Entrada', key: 'mcd_entry_time', width: 10, style: { numFmt: 'HH:mm:ss' } },
        { header: 'Hora de salida', key: 'mcd_leaving_time', width: 10, style: { numFmt: 'HH:mm:ss' } },
      ])
      .setData(data)
      .writeBuffer();

    res.header('Content-Disposition', 'attachment; filename="reporte.xlsx"');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  }

  @Get(':id')
  async findOne(@Param() params: ParamIdDto, @Res() res: Response) {
    const data = await this.medicalCalendars.findOne(params.id);
    if (!data) return rsp404(res);

    return rspOk(res, data);
  }

  @Post()
  @UseFilters(UnicityConflictExceptionFilter)
  async create(
    @Body() creationRequestDto: MedicalCalendarCreationRequestDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const total_hours = creationRequestDto.days.reduce((acc, day) => {
      const diffTime = diffMilitaryTime({
        startTime: day.entry_time,
        endTime: day.leaving_time,
        units: 'hours',
      });

      const hours_per_day = Math.round(diffTime.hours);

      day.hours_per_day = hours_per_day;

      return acc + hours_per_day;
    }, 0);

    const newMedicalCalendar = await this.medicalCalendars.create({
      ...creationRequestDto,
      total_hours,
    });

    const newId = newMedicalCalendar.id;

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: newId,
      // target_row_label: newId,
      log_target_id: LogTargetsIds.MEDICAL_CALENDAR,
      data: JSON.stringify(newMedicalCalendar),
    });

    return rsp201(res, newId);
  }

  @Patch(':id')
  @UseFilters(UnicityConflictExceptionFilter)
  async update(
    @Param() params: ParamIdDto,
    @Body() updateRequestDto: MedicalCalendarUpdateRequestDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const medicalCalendar = await this.medicalCalendars.findOne(params.id);
    if (!medicalCalendar) return rsp404(res);

    const dataChanged = this.logsService.getDataChangedJson(medicalCalendar, updateRequestDto);

    if (dataChanged) {
      const total_hours = updateRequestDto.days.reduce((acc, day) => {
        const diffTime = diffMilitaryTime({
          startTime: day.entry_time,
          endTime: day.leaving_time,
          units: 'hours',
        });

        const hours_per_day = Math.round(diffTime.hours);

        day.hours_per_day = hours_per_day;

        return acc + hours_per_day;
      }, 0);

      await this.medicalCalendars.update(params.id, {
        ...updateRequestDto,
        total_hours,
      });

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: medicalCalendar.id,
        // target_row_label: user.name,
        log_target_id: LogTargetsIds.MEDICAL_CALENDAR,
        data: dataChanged,
      });
    }

    return rspOkUpdated(res);
  }

  @Delete(':id/days')
  async deleteDays(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Body() query: ReqQueryDelete,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const medicalCalendarExists = await this.medicalCalendars.medicalCalendarExists(id);

    if (!medicalCalendarExists) throw new NotFoundException('No existe calendario médico');

    const { day_ids } = query;

    await this.medicalCalendars.deleteDays(id, day_ids);

    return rspOkDeleted(res);
  }
}
