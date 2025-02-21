import { Controller, Delete, Get, Param, Query, Res } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import {
  paginatedRspOk,
  rsp404,
  rspOkDeleted,
} from 'src/common/helpers/http-responses';
import { ReqQuery } from './dto/req-query.dto';
import { Response } from 'express';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { LogsService } from '../logs/logs.service';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogTargetsIds } from '../logs/entities/log-target';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly logsService: LogsService,
  ) { }

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.sessionsService.findAll(query);

    const items = result.items.map((session) => {
      const { token, ...result } = session;
      return result;
    });

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Delete(':id')
  async remove(@Param() params: ParamIdDto, @Res() res: Response, @AuthUser() authUser: User) {
    const session = await this.sessionsService.findOne(params.id);

    if (!session) return rsp404(res);

    await this.sessionsService.remove(params.id);

    this.logsService.create({
      log_type_id: LogTypesIds.LOGOUT,
      user_id: authUser.id,
      target_row_id: session.id,
      target_row_label: `del usuario ${session.user.name}`,
      log_target_id: LogTargetsIds.SESSION,
    });

    return rspOkDeleted(res);
  }
}
