import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import { EnabledDisabledDto } from 'src/common/dto/enabled-disabled.dto';
import { LogsService } from '../logs/logs.service';
import { LogTargetsIds } from '../logs/entities/log-target';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { NotificationsService } from './notifications.service';
import { paginatedRspOk, rsp404, rspOk, rspOkDeleted } from 'src/common/helpers/http-responses';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { ReadNotificationsDto } from './dto/read-notification.dto';
import { ReqQuery } from './dto/req-query.dto';
import { Request, Response } from 'express';
import { User } from '../users/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { extractTokenFromHeader } from 'src/common/helpers/generic';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private logsService: LogsService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
  ) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response, @Req() req: Request) {
    const token = extractTokenFromHeader(req);
    const payload = await this.authService.getPayloadFromToken(token);
    const user = await this.authService.getUserByPayload(payload);

    if (user) {
      query.user_id = user.id;
    }

    const result = await this.notificationsService.findAll(query);

    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }

  @Delete(':id')
  async remove(@Param() params: ParamIdDto, @Res() res: Response, @AuthUser() authUser: User) {
    const notification = await this.notificationsService.findOne(params.id);
    if (!notification) return rsp404(res);

    await this.notificationsService.remove(params.id);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: notification.id,
      target_row_label: notification.title,
      log_target_id: LogTargetsIds.NOTIFICATION,
    });

    return rspOkDeleted(res);
  }

  @Patch('/read')
  async read(@Body() body: ReadNotificationsDto, @Res() res: Response) {
    const response = await this.notificationsService.markAsRead(body.ids);
    return rspOk(res, { affected: response.affected });
  }

  @Patch('/:id/state')
  async updateState(
    @Param() params: ParamIdDto,
    @Body() updateStateDto: EnabledDisabledDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const notification = await this.notificationsService.findOne(params.id);
    if (!notification) return rsp404(res);

    if (updateStateDto.state === BaseEntityState.ENABLED) {
      await this.notificationsService.enable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.ENABLED,
        user_id: authUser.id,
        target_row_id: notification.id,
        target_row_label: notification.title,
        log_target_id: LogTargetsIds.NOTIFICATION,
      });
    }

    if (updateStateDto.state === BaseEntityState.DISABLED) {
      await this.notificationsService.disable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.DISABLED,
        user_id: authUser.id,
        target_row_id: notification.id,
        target_row_label: notification.title,
        log_target_id: LogTargetsIds.NOTIFICATION,
      });
    }

    return rspOk(res);
  }
}
