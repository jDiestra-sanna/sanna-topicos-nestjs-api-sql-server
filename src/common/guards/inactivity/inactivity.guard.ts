import { CanActivate, ExecutionContext, Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { SKIP_INACTIVITY_KEY } from 'src/common/decorators/skip-inactivity.decorator';
import { getSystemTime } from 'src/common/helpers/date';
import { AttendanceRecordsService } from 'src/modules/attendance-records/attendance-records.service';
import { CampusConditionIds } from 'src/modules/campus-conditions/entities/campus-condition.entity';
import { CampusService } from 'src/modules/campus/campus.service';
import { LogTargetsIds } from 'src/modules/logs/entities/log-target';
import { LogTypesIds } from 'src/modules/logs/entities/log-type.dto';
import { LogsService } from 'src/modules/logs/logs.service';
import { RoleIds } from 'src/modules/roles/entities/role.entity';
import { SessionsService } from 'src/modules/sessions/sessions.service';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class InactivityGuard implements CanActivate {
  constructor(
    @Inject(LogsService) private logsService: LogsService,
    @Inject(SessionsService) private sessionsService: SessionsService,
    @Inject(AuthService) private authService: AuthService,
    @Inject(AttendanceRecordsService) private attendanceRecordsService: AttendanceRecordsService,
    @Inject(CampusService) private campusService: CampusService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipGuard = this.reflector.getAllAndOverride<boolean>(SKIP_INACTIVITY_KEY, [
      context.getHandler,
      context.getClass(),
    ]);

    if (skipGuard) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user: User }>();

    if (!request.user) {
      throw new UnauthorizedException('No autorizado');
    }

    // const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    // const isActionMethod = methods.some(method => request.method === method);
    // if (!isActionMethod) return true;

    let lastActivity = (await this.logsService.getLastActivity(request.user.id))?.date_created;

    if (!lastActivity) {
      return true;
    }
    const now = new Date();
    const lastActivityDate = new Date(lastActivity);
    
    const nowLuxon = DateTime.fromJSDate(now);
    const lastActivityLuxon = DateTime.fromJSDate(lastActivityDate);    
    
    const diffInMinutes = nowLuxon.diff(lastActivityLuxon, 'minutes').minutes;

    if (diffInMinutes <= 30) {
      return true;
    }

    await this.logsService.create({
      log_type_id: LogTypesIds.DISCONNECTED_BY_INACTIVITY,
      user_id: 1,
      log_target_id: LogTargetsIds.USER,
      target_row_label: request.user.name + ' ' + request.user?.surname_first,
    });

    const roleId = request.user.role_id;

    if (roleId == RoleIds.HEALTH_TEAM) {
      const attendanceRecord = await this.attendanceRecordsService.findLastRecordUserAttending(request.user.id);

      if (attendanceRecord) {
        await this.attendanceRecordsService.update(
          { id: attendanceRecord.id },
          { leaving_time: getSystemTime(), leaving_observation: 'INACTIVIDAD' },
        );

        await this.campusService.partialUpdate(
          { id: attendanceRecord.campus_id },
          { condition_id: CampusConditionIds.OTHERS },
        );
      }
    }

    const lastSession = await this.sessionsService.getLastActiveSession(request.user.id);
    await this.sessionsService.removeManyByUserId(request.user.id);

    // Invalidar token
    const token = lastSession?.token;

    if (!token) {
      throw new UnauthorizedException('Desconectado por inactividad');
    }

    await this.authService.removeToken(token);

    throw new UnauthorizedException('Desconectado por inactividad');
  }
}
