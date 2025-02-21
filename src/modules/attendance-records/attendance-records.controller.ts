import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { getSystemDate, getSystemTime } from 'src/common/helpers/date';
import { rsp201, rspOk } from 'src/common/helpers/http-responses';
import { LogTargetsIds } from '../logs/entities/log-target';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogsService } from '../logs/logs.service';
import { MedicalCalendarsService } from '../medical-calendars/medical-calendars.service';
import { User } from '../users/entities/user.entity';
import { AttendanceRecordsService } from './attendance-records.service';
import { RegisterEntryTimeRequestDto } from './dto/register-entry-time.dto';
import { RegisterLeavingTimeDto } from './dto/register-leaving-time.dto';
import { extractTokenFromHeader } from 'src/common/helpers/generic';
import { SessionsService } from '../sessions/sessions.service';
import { RoleIds } from '../roles/entities/role.entity';
import { CampusService } from '../campus/campus.service';
import { CampusConditionIds } from '../campus-conditions/entities/campus-condition.entity';
import { AttendanceRecordLeavingIds } from './entities/attendance-record.entity';

@Controller('attendance-records')
export class AttendanceRecordsController {
  constructor(
    private readonly logsService: LogsService,
    private readonly attendanceRecordsService: AttendanceRecordsService,
    private readonly medicalCalendarsService: MedicalCalendarsService,
    private readonly sessionsService: SessionsService,
    private readonly campusService: CampusService,
  ) {}

  @Get('verify-entry')
  async verifyEntry(@Res() res: Response, @AuthUser() authUser: User, @Req() req: Request) {
    const current_date = getSystemDate();
    const current_time = getSystemTime();

    const token = extractTokenFromHeader(req);
    const session = await this.sessionsService.findOneBy(token);
    if (!session) throw new NotFoundException('No se encontró token de autenticación');

    const attendance_record = await this.attendanceRecordsService.findOneByUserDaySession(
      authUser.id,
      current_date,
      session.id,
    );
    const is_attendance_registered = await this.attendanceRecordsService.registeredEntryTime(
      authUser.id,
      current_date,
      session.id,
    );

    return rspOk(res, {
      current_date,
      current_time,
      is_attendance_registered,
      attendance_record
    });
  }

  @Get('verify-leaving')
  async verifyLeaving(@Res() res: Response, @AuthUser() authUser: User) {
    const current_date = getSystemDate();
    const current_time = getSystemTime();

    const is_leaving_time_registered = await this.attendanceRecordsService.registeredLeavingTime(
      authUser.id,
      current_date,
    );

    return rspOk(res, {
      current_date,
      current_time,
      is_leaving_time_registered,
    });
  }

  @Get('scheduled-campuses')
  async programmedCampuses(@Res() res: Response, @AuthUser() authUser: User) {
    if (authUser.role_id !== RoleIds.HEALTH_TEAM) throw new ForbiddenException('Rol inválido');

    const medicalCalendars = await this.medicalCalendarsService.scheduledCampuses(authUser.id);

    return rspOk(res, medicalCalendars);
  }

  @Post('entry-time')
  async registerEntryTime(
    @Body() registerEntryTimeRequestDto: RegisterEntryTimeRequestDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const token = extractTokenFromHeader(req);
    const session = await this.sessionsService.findOneBy(token);
    if (!session) throw new NotFoundException('No se encontró token de autenticación');

    const isScheduled = await this.medicalCalendarsService.isScheduled(authUser.id);
    if (!isScheduled) throw new ForbiddenException('Usted no tiene asignaciones para este mes');

    const medicalCalendars = await this.medicalCalendarsService.scheduledCampuses(authUser.id);
    if (
      !medicalCalendars.some(medicalCalendar => medicalCalendar.campus.id === registerEntryTimeRequestDto.campus_id)
    ) {
      throw new BadRequestException('Usted no tiene asignaciones en la sede seleccionada');
    }

    const newId = await this.attendanceRecordsService.registerEntryTime({
      ...registerEntryTimeRequestDto,
      user_id: authUser.id,
      session_id: session.id,
    });

    const campus = await this.campusService.findOne(registerEntryTimeRequestDto.campus_id);

    const todayAttendancesCount = await this.attendanceRecordsService.findCurrentDayCount(campus.id)

    if (campus.condition_id !== CampusConditionIds.NOT_OPERATIVE || todayAttendancesCount <= 1) {
      await this.campusService.update(campus.id, {
        condition_id: CampusConditionIds.OPERATIVE,
      });
    }

    this.logsService.create({
      log_type_id: LogTypesIds.REGISTERED_ENTRY_TIME,
      user_id: authUser.id,
      target_row_id: newId,
      log_target_id: LogTargetsIds.ATTENDANCE_RECORD,
      data: JSON.stringify(registerEntryTimeRequestDto),
    });

    return rspOk(res);
  }

  @Patch('leaving-time')
  async registerLeavingTime(
    @Body() registerLeavingTimeDto: RegisterLeavingTimeDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const token = extractTokenFromHeader(req);
    const session = await this.sessionsService.findOneBy(token);

    if (!session) throw new NotFoundException('No se encontró token de autenticación');

    const attendanceRecord = await this.attendanceRecordsService.findOneByUserDaySession(
      authUser.id,
      registerLeavingTimeDto.day,
      session.id,
    );

    if (!attendanceRecord) throw new NotFoundException('No existe registro de asistencia para el dia enviado');
    if (attendanceRecord.leaving_time) throw new ConflictException('La Hora de salida ya ha sido ingresada');

    const isLeavingTimeCorrect = await this.attendanceRecordsService.isLeavingTimeCorrect(
      authUser.id,
      registerLeavingTimeDto.day,
      session.id,
      registerLeavingTimeDto.leaving_time,
    );
    if (!isLeavingTimeCorrect) throw new BadRequestException('Hora de salida invalida');

    await this.attendanceRecordsService.registerLeavingTime(
      authUser.id,
      registerLeavingTimeDto.day,
      session.id,
      registerLeavingTimeDto.leaving_time,
      registerLeavingTimeDto.leaving_observation,
    );

    const campus = await this.campusService.findOne(attendanceRecord.campus_id);
    if (campus.condition_id !== CampusConditionIds.NOT_OPERATIVE) {
      switch (registerLeavingTimeDto.leaving_id) {
        case AttendanceRecordLeavingIds.TURN_SHIFT:
          await this.campusService.update(campus.id, {
            condition_id: CampusConditionIds.TURN_SHIFT,
          });
          break;

        case AttendanceRecordLeavingIds.LAST_TURN:
          await this.campusService.update(campus.id, {
            condition_id: CampusConditionIds.NOT_OPERATIVE,
          });
          break;

        case AttendanceRecordLeavingIds.OTHERS:
          await this.campusService.update(campus.id, {
            condition_id: CampusConditionIds.OTHERS,
          });
          break;
      }
    }

    this.logsService.create({
      log_type_id: LogTypesIds.REGISTERED_LEAVING_TIME,
      user_id: authUser.id,
      target_row_id: attendanceRecord.id,
      log_target_id: LogTargetsIds.ATTENDANCE_RECORD,
      data: JSON.stringify(registerLeavingTimeDto),
    });

    return rspOk(res);
  }
}
