import { BadRequestException, Body, Controller, Delete, Param, ParseIntPipe, Patch, Res } from '@nestjs/common';
import CampusSchedulesService from './campus-schedules.service';
import { EnabledDisabledDto } from 'src/common/dto/enabled-disabled.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { rspOk, rspOkDeleted } from 'src/common/helpers/http-responses';
import { Response } from 'express';

@Controller('campus/:campusId/schedules')
export class CampusSchedulesController {
  constructor(private campusSchedulesService: CampusSchedulesService) {}

  @Delete('/:id')
  async remove(
    @Param('campusId', new ParseIntPipe({ errorHttpStatusCode: 400 })) campusId: number,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Res() res: Response,
  ) {
    const campusSchedule = await this.campusSchedulesService.findOneBy(id, campusId);

    if (!campusSchedule) throw new BadRequestException('No existe horario asociado a la sede especificada');

    await this.campusSchedulesService.remove(id);

    return rspOkDeleted(res);
  }

  @Patch('/:id/state')
  async updateState(
    @Param('campusId', new ParseIntPipe({ errorHttpStatusCode: 400 })) campusId: number,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Body() updateStateDto: EnabledDisabledDto,
    @Res() res: Response,
  ) {
    const campusSchedule = await this.campusSchedulesService.findOneBy(id, campusId);

    if (!campusSchedule) throw new BadRequestException('No existe horario asociado a la sede especificada');

    if (updateStateDto.state === BaseEntityState.ENABLED) {
      await this.campusSchedulesService.enable(id);
    }

    if (updateStateDto.state === BaseEntityState.DISABLED) {
      await this.campusSchedulesService.disable(id);
    }

    return rspOk(res);
  }
}
