import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { paginatedRspOk } from 'src/common/helpers/http-responses';
import { ReqQuery } from './dto/req-query.dto';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
  constructor(private logService: LogsService) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.logService.findAll(query);

    return paginatedRspOk(
      res,
      result.items,
      result.total,
      result.limit,
      result.page,
    );
  }
}
