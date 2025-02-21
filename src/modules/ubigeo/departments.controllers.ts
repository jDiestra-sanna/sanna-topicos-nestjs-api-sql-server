import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { paginatedRspOk } from 'src/common/helpers/http-responses';
import { ReqQueryDepartment } from './dto/req-query-department.dto';
import { UbigeoPeruDepartmentsService } from './departments.service';

@Controller('ubigeo-peru-departments')
export class UbigeoPeruDepartmentsController {
  constructor(private departmentsService: UbigeoPeruDepartmentsService) {}

  @Get()
  async findAll(@Query() query: ReqQueryDepartment, @Res() res: Response) {
    const result = await this.departmentsService.findAll(query);

    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }
}
