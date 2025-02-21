import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalDiagnosis } from './entity/medical-diagnosis.entity';
import { Repository } from 'typeorm';
import { ReqQuery } from './dto/req_query';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { CreateMedicalDiagnosisDto } from './dto/create-medical-diagnosis.dto';
import { UpdateMedicalDiagnosisDto } from './dto/update-medical-diagnosis.dto';
import { getSystemDatetime } from 'src/common/helpers/date';

@Injectable()
export class MedicalDiagnosesService {
  constructor(@InjectRepository(MedicalDiagnosis) private medicalDiagnosesRepository: Repository<MedicalDiagnosis>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<MedicalDiagnosis>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.medicalDiagnosesRepository.createQueryBuilder('medical_diagnoses');

    qb.leftJoinAndSelect('medical_diagnoses.main_diagnosis', 'main_diagnosis');
    qb.leftJoinAndSelect('medical_diagnoses.secondary_diagnosis', 'secondary_diagnosis');
    qb.leftJoinAndSelect('medical_diagnoses.biological_system', 'biological_system');
    qb.leftJoinAndSelect('medical_diagnoses.medical_consultation', 'medical_consultation');

    qb.andWhere('medical_diagnoses.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.main_diagnosis_id) {
      qb.andWhere('medical_diagnoses.main_diagnosis_id = :main_diagnosis_id', {
        main_diagnosis_id: req_query.main_diagnosis_id,
      });
    }

    if (req_query.secondary_diagnosis_id) {
      qb.andWhere('medical_diagnoses.secondary_diagnosis_id = :secondary_diagnosis_id', {
        secondary_diagnosis_id: req_query.secondary_diagnosis_id,
      });
    }

    if (req_query.biological_system_id) {
      qb.andWhere('medical_diagnoses.biological_system_id = :biological_system_id', {
        biological_system_id: req_query.biological_system_id,
      });
    }

    if (req_query.medical_consultation_id) {
      qb.andWhere('medical_diagnoses.medical_consultation_id = :medical_consultation_id', {
        medical_consultation_id: req_query.medical_consultation_id,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(medical_diagnoses.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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
    const medicalDiagnosis = await this.medicalDiagnosesRepository.findOne({
      where: { id },
      relations: ['main_diagnosis', 'secondary_diagnosis', 'biological_system', 'medical_consultation'],
    });

    if (!medicalDiagnosis) return null;

    return medicalDiagnosis;
  }

  async create(createMedicalDiagnosisDto: CreateMedicalDiagnosisDto) {
    const newMedicalDiagnosis = await this.medicalDiagnosesRepository.save({ ...createMedicalDiagnosisDto });

    if (!newMedicalDiagnosis) return null;

    return newMedicalDiagnosis.id;
  }

  async update(id: number, updateMedicalDiagnosisDto: UpdateMedicalDiagnosisDto) {
    const medicalDiagnosis = await this.medicalDiagnosesRepository.findOneBy({ id });
    if (!medicalDiagnosis) return;

    medicalDiagnosis.date_updated = getSystemDatetime();
    const updatedMedicalDiagnosis = Object.assign(medicalDiagnosis, updateMedicalDiagnosisDto);
    await this.medicalDiagnosesRepository.save(updatedMedicalDiagnosis);
  }

  async remove(id: number, forever: boolean = false) {
    const medicalDiagnosis = await this.medicalDiagnosesRepository.findOneBy({ id });
    if (!medicalDiagnosis) return;

    if (forever) {
      await this.medicalDiagnosesRepository.delete(id);
    } else {
      medicalDiagnosis.state = BaseEntityState.DELETED;
      medicalDiagnosis.date_deleted = getSystemDatetime();
      await this.medicalDiagnosesRepository.save(medicalDiagnosis);
    }
  }

  async enable(id: number) {
    const medicalDiagnosis = await this.medicalDiagnosesRepository.findOneBy({ id });
    if (!medicalDiagnosis) return;

    medicalDiagnosis.state = BaseEntityState.ENABLED;
    medicalDiagnosis.date_updated = getSystemDatetime();

    await this.medicalDiagnosesRepository.save(medicalDiagnosis);
  }

  async disable(id: number) {
    const medicalDiagnosis = await this.medicalDiagnosesRepository.findOneBy({ id });
    if (!medicalDiagnosis) return;

    medicalDiagnosis.state = BaseEntityState.DISABLED;
    medicalDiagnosis.date_updated = getSystemDatetime();

    await this.medicalDiagnosesRepository.save(medicalDiagnosis);
  }
}
