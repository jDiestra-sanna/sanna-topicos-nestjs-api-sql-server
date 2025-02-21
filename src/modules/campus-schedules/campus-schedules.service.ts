import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CampusSchedule } from './entities/campus-schedule.entity';
import { Repository } from 'typeorm';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { getSystemDatetime } from 'src/common/helpers/date';

@Injectable()
export default class CampusSchedulesService {
  constructor(@InjectRepository(CampusSchedule) private campusSchedulesRepository: Repository<CampusSchedule>) {}

  async remove(id: number, forever: boolean = false) {
    const campusSchedule = await this.campusSchedulesRepository.findOneBy({ id });

    if (!campusSchedule) return;

    if (forever) {
      await this.campusSchedulesRepository.delete(id);
    } else {
      campusSchedule.state = BaseEntityState.DELETED;
      campusSchedule.date_deleted = getSystemDatetime();

      await this.campusSchedulesRepository.save(campusSchedule);
    }
  }

  async enable(id: number) {
    const campusSchedule = await this.campusSchedulesRepository.findOneBy({ id });

    if (!campusSchedule) return;

    campusSchedule.state = BaseEntityState.ENABLED;
    campusSchedule.date_updated = getSystemDatetime();

    await this.campusSchedulesRepository.save(campusSchedule);
  }

  async disable(id: number) {
    const campusSchedule = await this.campusSchedulesRepository.findOneBy({ id });

    if (!campusSchedule) return;

    campusSchedule.state = BaseEntityState.DISABLED;
    campusSchedule.date_updated = getSystemDatetime();

    await this.campusSchedulesRepository.save(campusSchedule);
  }

  async findOneBy(id: number, campus_id: number): Promise<CampusSchedule> | null {
    const campusSchedule = await this.campusSchedulesRepository.findOneBy({ id, campus_id });

    if (!campusSchedule) return null;

    return campusSchedule;
  }
}
