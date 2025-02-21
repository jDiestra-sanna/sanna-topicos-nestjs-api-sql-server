import { Controller, ForbiddenException, Get, Query, Res } from '@nestjs/common';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { TopicsService } from './topics.service';
import { User } from '../users/entities/user.entity';
import { RoleIds } from '../roles/entities/role.entity';
import { rspOk } from 'src/common/helpers/http-responses';
import { Response } from 'express';

@Controller('topic-managments')
export class TopicManagementsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  async findAllTopicManagements(@AuthUser() authUser: User, @Res() res: Response) {
    if (authUser.role_id !== RoleIds.CLIENT && authUser.role_id !== RoleIds.Admin) {
      throw new ForbiddenException('Usted no está autorizado para ver este módulo');
    }

    const items = await this.topicsService.findAllTopicManagements(authUser.id, authUser.is_central);

    return rspOk(res, items);
  }
}
