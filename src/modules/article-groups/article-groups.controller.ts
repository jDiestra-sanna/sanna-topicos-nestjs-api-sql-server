import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ArticleGroupsService } from './article-groups.service';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { Response, query } from 'express';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { CreateArticleGroupDto } from './dto/create-article-group.dto';
import { UpdateArticleGroupDto } from './dto/update-article-group.dto';
import { ReqQuery } from './dto/req-query.dto';

@Controller('article-groups')
export class ArticleGroupsController {
  constructor(private articleGroupsService: ArticleGroupsService) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.articleGroupsService.findAll(query)
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page)

    // const data = await this.articleGroupsService.findAll();
    // return data;
  }

  @Get(':id')
  async findOne(@Param() params: ParamIdDto, @Res() res: Response) {
    const data = await this.articleGroupsService.findOne(params.id);
    if (!data) return rsp404(res);
    return rspOk(res, data);
  }

  @Post()
  async create(@Body() createArticleGroupDto: CreateArticleGroupDto, @Res() res: Response) {
    const idArticleGroup = await this.articleGroupsService.create(createArticleGroupDto);
    return rsp201(res, idArticleGroup);
  }

  @Patch(':id')
  async update(
    @Param() params: ParamIdDto,
    @Body() updateArticleGroupDto: UpdateArticleGroupDto,
    @Res() res: Response,
  ) {
    const articleGroup = await this.articleGroupsService.findOne(params.id);

    if (!articleGroup) return rsp404(res);

    await this.articleGroupsService.update(params.id, updateArticleGroupDto);

    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(@Param() params: ParamIdDto, @Res() res: Response) {
    const articleGroup = await this.articleGroupsService.findOne(params.id);

    if (!articleGroup) return rsp404(res);
    await this.articleGroupsService.remove(params.id);

    return rspOkDeleted(res);
  }
}
