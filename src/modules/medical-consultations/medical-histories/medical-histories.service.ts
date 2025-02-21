import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalHistory } from './entities/medical-history.entity';
import { Repository } from 'typeorm';
import { ReqQuery } from './dto/req-query';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';
import { UpdateMedicalHistoryDto } from './dto/update-medical-history.dto';
import { getSystemDatetime } from 'src/common/helpers/date';

@Injectable()
export class MedicalHistoriesService {
  constructor(@InjectRepository(MedicalHistory) private medicalHistoriesRepository: Repository<MedicalHistory>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<MedicalHistory>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.medicalHistoriesRepository.createQueryBuilder('medical_histories');

    qb.leftJoinAndSelect('medical_histories.patient', 'patient');
    qb.where('medical_histories.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.patient_id) {
      qb.andWhere('medical_histories.patient_id = :patient_id', { patient_id: req_query.patient_id });
    }

    if (req_query.query) {
      qb.andWhere('CONCAT(medical_histories.surgical_history, medical_histories.others_description) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST (medical_histories.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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

  async findOne(id: number) {
    const medicalHistory = await this.medicalHistoriesRepository.findOne({
      where: {id},
      relations: ['patient']
    })

    if (!medicalHistory) return null

    return medicalHistory
  }

  async create(createMedicalHistoryDto: CreateMedicalHistoryDto) {
    const newMedicalHistory = await this.medicalHistoriesRepository.save({ ...createMedicalHistoryDto });
    if (!newMedicalHistory) return null;

    return newMedicalHistory.id;
  }

  async update(id: number, updateMedicalHistoryDto: UpdateMedicalHistoryDto) {
    const medicalHistory = await this.medicalHistoriesRepository.findOneBy({ id });
    if (!medicalHistory) return;

    medicalHistory.date_updated = getSystemDatetime();
    const updatedMedicalHistory = Object.assign(medicalHistory, updateMedicalHistoryDto);
    await this.medicalHistoriesRepository.save(updatedMedicalHistory);
  }

  async remove(id: number, forever: boolean = false) {
    const medicalHistory = await this.medicalHistoriesRepository.findOneBy({ id });
    if (!medicalHistory) return;

    if (forever) {
      await this.medicalHistoriesRepository.delete(id);
    } else {
      medicalHistory.state = BaseEntityState.DELETED;
      medicalHistory.date_deleted = getSystemDatetime();
      await this.medicalHistoriesRepository.save(medicalHistory);
    }
  }

  async enable(id: number) {
    const medicalHistory = await this.medicalHistoriesRepository.findOneBy({ id });
    if (!medicalHistory) return;

    medicalHistory.state = BaseEntityState.ENABLED;
    medicalHistory.date_updated = getSystemDatetime();

    await this.medicalHistoriesRepository.save(medicalHistory);
  }

  async disable(id: number) {
    const medicalHistory = await this.medicalHistoriesRepository.findOneBy({ id });
    if (!medicalHistory) return;

    medicalHistory.state = BaseEntityState.DISABLED;
    medicalHistory.date_updated = getSystemDatetime();

    await this.medicalHistoriesRepository.save(medicalHistory);
  }
}
