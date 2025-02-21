import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { paginatedRspOk } from 'src/common/helpers/http-responses';
import { ReqQuery } from './dto/req-query.dto';
import { ProffesionsService } from './proffesions.service';

@Controller('proffesions')
export class ProffesionsController {
  constructor(private proffesionsService: ProffesionsService) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.proffesionsService.findAll(query);
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }
}
