import { Controller, Get, Res } from '@nestjs/common';
import { FakerService } from 'src/faker/faker.service';
import { Response } from 'express';
import { rspOk } from 'src/common/helpers/http-responses';
import { SkipAuth } from 'src/common/decorators/public.decorator';

@Controller('test-spaces')
export class TestSpacesController {
  constructor(private readonly fakerService: FakerService) {}

  @SkipAuth()
  @Get()
  async index(@Res() res: Response) {
    // await this.fakerService.fillGroups(10);
    // await this.fakerService.fillClients(10);
    // await this.fakerService.fillCampus(10);
    // await this.fakerService.fillUsers(20);
    // await this.fakerService.fillMedicalConsultations(20);
   return rspOk(res, '25');
  }
}
