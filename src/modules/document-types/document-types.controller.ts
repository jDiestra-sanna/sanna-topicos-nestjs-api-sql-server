import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { paginatedRspOk } from 'src/common/helpers/http-responses';
import { DocumentTypesService } from './document-type.service';
import { ReqQuery } from './dto/req-query.dto';

@Controller('document-types')
export class DocumentTypesController {
  constructor(private documentTypesService: DocumentTypesService) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.documentTypesService.findAll(query);
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }
}
