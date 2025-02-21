import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { paginatedRspOk } from 'src/common/helpers/http-responses';
import { ReqQuery } from './dto/req-query.dto';
import { FileTypesService } from './file-types.service';

@Controller('file-types')
export class FileTypesController {
  constructor(private fileTypesService: FileTypesService) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.fileTypesService.findAll(query);
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }
}
