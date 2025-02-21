import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CampusCondition } from './entities/campus-condition.entity';
import { Repository } from 'typeorm';
import { Campus } from '../campus/entities/campus.entity';

@Injectable()
export class CampusConditionsService {
  constructor(@InjectRepository(CampusCondition) private campusConditionsService: Repository<Campus>) {}

  async findOne(id: number) {
    const campusCondition = await this.campusConditionsService.findOneBy({ id });

    if (!campusCondition) return null

    return campusCondition
  }
}
