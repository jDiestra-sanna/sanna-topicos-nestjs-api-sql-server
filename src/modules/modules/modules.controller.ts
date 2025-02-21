import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { EnabledDisabledDto } from 'src/common/dto/enabled-disabled.dto';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';
import {
  rsp404,
  rspOk,
  rspOkDeleted,
  rspOkUpdated,
} from 'src/common/helpers/http-responses';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModulesService } from './modules.service';
import { ReqQuery } from './dto/req-query.dto';

@Controller('modules')
export class ModulesController {
  constructor(private modulesService: ModulesService) {}

  @Get()
  async findAll(@Query() reqQuery: ReqQuery, @Res() res: Response) {
    if (reqQuery.nested) {
      const modules = await this.modulesService.findAllNested();

      return rspOk(res, modules);
    } else {
      const modules = await this.modulesService.findAll();

      return rspOk(res, modules);
    }
  }

  @Get(':id')
  async findOne(@Param() params: ParamIdDto, @Res() res: Response) {
    const data = await this.modulesService.findOne(params.id);

    if (!data) return rsp404(res);

    return rspOk(res, data);
  }

  @Patch(':id')
  async update(
    @Param() params: ParamIdDto,
    @Body() updateModuleDto: UpdateModuleDto,
    @Res() res: Response,
  ) {
    const role = await this.modulesService.findOne(params.id);

    if (!role) return rsp404(res);

    await this.modulesService.update(params.id, updateModuleDto);

    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(@Param() params: ParamIdDto, @Res() res: Response) {
    const role = await this.modulesService.findOne(params.id);

    if (!role) return rsp404(res);

    await this.modulesService.remove(params.id);

    return rspOkDeleted(res);
  }

  @Patch('/:id/state')
  async updateState(
    @Param() params: ParamIdDto,
    @Body() updateStateDto: EnabledDisabledDto,
    @Res() res: Response,
  ) {
    const role = await this.modulesService.findOne(params.id);

    if (!role) return rsp404(res);

    if (updateStateDto.state === BaseEntityState.ENABLED) {
      await this.modulesService.enable(params.id);
    }

    if (updateStateDto.state === BaseEntityState.DISABLED) {
      await this.modulesService.disable(params.id);
    }

    return rspOk(res);
  }
}
