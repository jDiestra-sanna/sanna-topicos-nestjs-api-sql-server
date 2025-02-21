import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { paginatedRspOk } from 'src/common/helpers/http-responses';
import { ReqQuery } from './dto/req-query.dto';
import { CostCentersService } from './cost-centers.service';

@Controller('cost-centers')
export class CostCentersController {
  constructor(private costCentersService: CostCentersService) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.costCentersService.findAll(query);
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }
}
