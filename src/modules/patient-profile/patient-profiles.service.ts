import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientProfile } from './entity/patient-profile.entity';
import { Repository } from 'typeorm';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { ReqQuery } from './dto/req-query';
import { BaseEntityState } from 'src/common/entities/base.entity';

@Injectable()
export class PatientProfilesService {
  constructor(@InjectRepository(PatientProfile) private patientProfilesRepository: Repository<PatientProfile>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<PatientProfile>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.patientProfilesRepository.createQueryBuilder('patient_profiles');

    qb.where('patient_profiles.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.query) {
      qb.andWhere('CONCAT(patient_profiles.name) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(patient_profiles.date_created AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: req_query.date_from,
        date_to: req_query.date_to,
      });
    }

    const total = await qb.getCount();
    qb.skip(skip);
    qb.take(req_query.limit);
    qb.orderBy(req_query.order_col, req_query.order_dir);

    const items = await qb.getMany();

    return {
      total,
      items,
      limit: req_query.limit,
      page: req_query.page,
    };
  }

  async patientProfileExists(id: number) {
    return await this.patientProfilesRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
