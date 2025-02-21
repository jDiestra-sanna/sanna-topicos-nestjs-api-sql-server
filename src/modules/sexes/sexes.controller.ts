import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { paginatedRspOk } from 'src/common/helpers/http-responses';
import { ReqQuery } from './dto/req-query.dto';
import { SexesService } from './sexes.service';

@Controller('sexes')
export class SexesController {
  constructor(private sexesService: SexesService) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.sexesService.findAll(query);
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }
}
