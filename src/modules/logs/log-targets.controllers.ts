import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { rspOk } from 'src/common/helpers/http-responses';
import { LogTargetsService } from './log-targets.service';

@Controller('log-targets')
export class LogTargetsController {
    constructor(private logTargetsService: LogTargetsService) { }

    @Get()
    async findAll(@Res() res: Response) {
        const items = await this.logTargetsService.findAll();

        return rspOk(res, items)
    }
}
