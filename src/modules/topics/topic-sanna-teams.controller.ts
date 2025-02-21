import { Controller, ForbiddenException, Get, Query, Res } from '@nestjs/common';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { TopicsService } from './topics.service';
import { User } from '../users/entities/user.entity';
import { RoleIds } from '../roles/entities/role.entity';
import { ReqQuery } from './dto/req_query.dto';
import { paginatedRspOk, rsp404 } from 'src/common/helpers/http-responses';
import { Response } from 'express';

@Controller('topic-sanna-teams')
export class TopicSannaTeamsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  async findAllSannaTeams(@Query() query: ReqQuery, @AuthUser() authUser: User, @Res() res: Response) {
    if (authUser.role_id !== RoleIds.CLIENT && authUser.role_id !== RoleIds.Admin || !authUser.id)
      throw new ForbiddenException('Usted no está autorizado para ver este módulo');

    const result = await this.topicsService.findAllSannaTeams(query, authUser.id, authUser.is_central);

    if (!result) return rsp404(res, 'No se encontró ningún campus asignado para este usuario');

    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }
}
