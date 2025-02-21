import { BadRequestException, Controller, ForbiddenException, Get, Query, Res } from '@nestjs/common';
import { ConsultationHistoriesService } from './consultation-history.service';
import { ReqQuery } from './dto/req-query.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { paginatedRspOk } from 'src/common/helpers/http-responses';
import { Response } from 'express';
import { RoleIds } from '../roles/entities/role.entity';

@Controller('consultation-histories')
export class ConsultationHistoriesController {
  constructor(private consultationHistoriesService: ConsultationHistoriesService) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @AuthUser() authUser: User, @Res() res: Response) {
    if (authUser.role_id != RoleIds.HEALTH_TEAM && authUser.role_id != RoleIds.CLIENT && authUser.role_id != RoleIds.Admin)
      throw new ForbiddenException('Usted no está autorizado para ver este módulo');

    const result = await this.consultationHistoriesService.findAll(query, authUser);

    if (!result) throw new BadRequestException('Usuario no tiene asignado ninguna sede ó no ha registrado asistencia');
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }
}
