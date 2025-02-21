import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { paginatedRspOk } from 'src/common/helpers/http-responses';
import { UbigeoPeruDistrictsService } from './districts.service';
import { ReqQueryDistrict } from './dto/req-query-district.dto';

@Controller('ubigeo-peru-districts')
export class UbigeoPeruDistrictsController {
  constructor(private districtsService: UbigeoPeruDistrictsService) {}

  @Get()
  async findAll(@Query() query: ReqQueryDistrict, @Res() res: Response) {
    const result = await this.districtsService.findAll(query);

    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }
}
