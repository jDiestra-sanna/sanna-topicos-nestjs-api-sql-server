import { Controller, Get, Query, Res } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ReqQuery } from './dto/req-query.dto';
import { Response } from 'express';
import { rspOk } from 'src/common/helpers/http-responses';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(@Res() res: Response, @Query() req_query: ReqQuery, @AuthUser() authUser: User) {
    const data = await this.dashboardService.getDashboardData({
      ...req_query,
      role_id: authUser.role_id,
      user_id: authUser.id,
      is_central: authUser.is_central
    });
    rspOk(res, data);
  }

  @Get('rotation-medications')
  async getRotationMedications(@Res() res: Response, @Query() req_query: ReqQuery) {
    const data = await this.dashboardService.getRotationMedications(req_query);
    rspOk(res, data);
  }
}
