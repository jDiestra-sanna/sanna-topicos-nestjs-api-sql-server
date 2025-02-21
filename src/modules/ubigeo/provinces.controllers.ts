import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { paginatedRspOk } from 'src/common/helpers/http-responses';
import { ReqQueryProvince } from './dto/req-query-province.dto';
import { UbigeoPeruProvincesService } from './provinces.service';

@Controller('ubigeo-peru-provinces')
export class UbigeoPeruProvincesController {
  constructor(private provincesService: UbigeoPeruProvincesService) {}

  @Get()
  async findAll(@Query() query: ReqQueryProvince, @Res() res: Response) {
    const result = await this.provincesService.findAll(query);

    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }
}
