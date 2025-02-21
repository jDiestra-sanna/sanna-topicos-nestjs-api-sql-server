import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { rspOk } from 'src/common/helpers/http-responses';
import { LogTypesService } from './log-types.service';

@Controller('log-types')
export class LogTypesController {
    constructor(private logTypeService: LogTypesService) { }

    @Get()
    async findAll(@Res() res: Response) {
        const items = await this.logTypeService.findAll();

        return rspOk(res, items)
    }
}
