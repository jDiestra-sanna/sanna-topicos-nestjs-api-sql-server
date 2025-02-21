import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { FormFactorsService } from './form-factor.service';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { Response } from 'express';
import { CreateFormFactorDto } from './dto/create-form-factor.dto';
import { UpdateFormFactorDto } from './dto/update-form-factor.dto';
import { ReqQuery } from './dto/req-query.dto';


@Controller('form-factors')
export class FormFactorController {
  constructor(private formFactorService: FormFactorsService) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.formFactorService.findAll(query)
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page)
  }

  @Get('/:id')
  async findOne(@Param() params: ParamIdDto, @Res() res: Response) {
    const data = await this.formFactorService.findOne(params.id);
    if (!data) return rsp404(res);
    return rspOk(res, data);
  }

  @Post()
  async create(@Body() createFormFactorDto: CreateFormFactorDto, @Res() res: Response) {
    const idFormFactor = await this.formFactorService.create(createFormFactorDto);
    return rsp201(res, idFormFactor);
  }

  @Patch(':id')
  async update(@Param() params: ParamIdDto, @Body() updateFormFactorDto: UpdateFormFactorDto, @Res() res: Response) {
    const articleGroup = await this.formFactorService.findOne(params.id);

    if (!articleGroup) return rsp404(res);

    await this.formFactorService.update(params.id, updateFormFactorDto);

    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(@Param() params: ParamIdDto, @Res() res: Response) {
    const articleGroup = await this.formFactorService.findOne(params.id);

    if (!articleGroup) return rsp404(res);
    await this.formFactorService.remove(params.id);

    return rspOkDeleted(res);
  }
}
