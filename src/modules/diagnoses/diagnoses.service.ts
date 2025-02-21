import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Diagnosis } from './entities/diagnosis.entity';
import { Repository } from 'typeorm';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { getSystemDatetime } from 'src/common/helpers/date';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { ReqQuery } from './dto/req-query.dto';

@Injectable()
export class DiagnosesService {
  constructor(@InjectRepository(Diagnosis) private diagnosisRepository: Repository<Diagnosis>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<Diagnosis>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.diagnosisRepository.createQueryBuilder('diagnoses');

    qb.leftJoinAndSelect('diagnoses.proffesion', 'proffesion');
    qb.leftJoinAndSelect('diagnoses.diagnosis_type', 'diagnosis_type');
    qb.where('diagnoses.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.diagnosis_type_id) {
      qb.andWhere('diagnoses.diagnosis_type = :diagnosis_type_id', {
        diagnosis_type_id: req_query.diagnosis_type_id,
      });
    }

    if (req_query.proffesion_id) {
      qb.andWhere('diagnoses.proffesion = :proffesion_id', { proffesion_id: req_query.proffesion_id });
    }

    if (req_query.query) {
      qb.andWhere('CONCAT(diagnoses.name, diagnoses.code) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(diagnoses.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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
    const diagnosis = await this.diagnosisRepository.findOne({
      where: { id },
      relations: ['proffesion', 'diagnosis_type'],
    });

    if (!diagnosis) return null;

    return diagnosis;
  }

  async create(createDiagnosisDto: CreateDiagnosisDto) {
    const newDiagnosis = await this.diagnosisRepository.save({ ...createDiagnosisDto });
    if (!newDiagnosis) return null;
    return newDiagnosis;
  }

  async update(id: number, updateDiagnosisDto: UpdateDiagnosisDto) {
    const diagnosis = await this.diagnosisRepository.findOneBy({ id });
    if (!diagnosis) return;
    diagnosis.date_updated = getSystemDatetime();
    const updatedDiagnosis = Object.assign(diagnosis, updateDiagnosisDto);
    await this.diagnosisRepository.save(updatedDiagnosis);
  }

  async remove(id: number, forever: boolean = false) {
    const diagnosis = await this.diagnosisRepository.findOneBy({ id });
    if (!diagnosis) return;

    if (forever) {
      await this.diagnosisRepository.delete(id);
    } else {
      diagnosis.state = BaseEntityState.DELETED;
      diagnosis.date_deleted = getSystemDatetime();
      await this.diagnosisRepository.save(diagnosis);
    }
  }

  async enable(id: number) {
    const diagnosis = await this.diagnosisRepository.findOneBy({ id });
    if (!diagnosis) return;

    diagnosis.state = BaseEntityState.ENABLED;
    diagnosis.date_updated = getSystemDatetime();

    await this.diagnosisRepository.save(diagnosis);
  }

  async disable(id: number) {
    const diagnosis = await this.diagnosisRepository.findOneBy({ id });
    if (!diagnosis) return;

    diagnosis.state = BaseEntityState.DISABLED;
    diagnosis.date_updated = getSystemDatetime();

    await this.diagnosisRepository.save(diagnosis);
  }

  async diagnosisExistsByCode(code: string, excludeDiagnosisId: number = 0): Promise<boolean> {
    let qb = this.diagnosisRepository.createQueryBuilder('diagnoses');
    qb.where('diagnoses.code = :code', { code });

    if (excludeDiagnosisId) qb.andWhere('diagnoses.id != :excludeDiagnosisId', { excludeDiagnosisId });

    qb.andWhere('diagnoses.state != :state', { state: BaseEntityState.DELETED });

    const count = await qb.getCount();
    return count > 0;
  }

  async diagnosisExists(id: number) {
    return await this.diagnosisRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
