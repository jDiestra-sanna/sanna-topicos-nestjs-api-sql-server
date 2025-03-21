import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Not, Repository } from 'typeorm';
import { ReqQuery } from './dto/req-query';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { getSystemDatetime } from 'src/common/helpers/date';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { documentType } from 'src/modules/document-types/entities/document-types.entity';

@Injectable()
export class PatientsService {
  constructor(@InjectRepository(Patient) private patientsRepository: Repository<Patient>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<Patient>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.patientsRepository.createQueryBuilder('patients');

    qb.leftJoinAndSelect('patients.document_type', 'document_types');
    qb.leftJoinAndSelect('patients.sex', 'sexes');
    qb.leftJoinAndSelect('patients.patient_profile', 'patient_profiles');
    qb.leftJoinAndSelect('patients.allergy', 'allergy');
    qb.leftJoinAndSelect('patients.medical_history', 'medical_history');
    qb.where('patients.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.document_type_id) {
      qb.andWhere('patients.document_type_id = :document_type_id', {
        document_type_id: req_query.document_type_id,
      });
    }

    if (req_query.sex_id) {
      qb.andWhere('patients.sex_id = :sex_id', {
        sex_id: req_query.sex_id,
      });
    }

    if (req_query.patient_profile_id) {
      qb.andWhere('patients.patient_profile_id = :patient_profile_id', {
        patient_profile_id: req_query.patient_profile_id,
      });
    }

    if (req_query.query) {
      qb.andWhere('CONCAT(patients.name, patients.surname_first, patients.surname_second) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(patients.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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

  async findOne(id: number, includeRelations = true) {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['document_type', 'sex', 'patient_profile', 'allergy', 'medical_history'],
    });

    if (!patient) return null;

    return patient;
  }

  async findOneByDocument(documentNumber: string, documentTypeId: documentType) {
    const patient = await this.patientsRepository.findOne({
      where: {
        document_number: documentNumber,
        document_type_id: documentTypeId,
        state: Not(BaseEntityState.DELETED),
      },
      relations: ['document_type', 'sex', 'patient_profile', 'allergy', 'medical_history'],
    });

    if (!patient) return null;

    return patient;
  }

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    if (createPatientDto.document_type_id === documentType.FOREIGN_CARD)
      createPatientDto.document_number = createPatientDto.document_number.padStart(12, '0');

    const newPatient = await this.patientsRepository.save({ ...createPatientDto });

    if (!newPatient) return null;

    return newPatient;
  }

  async update(id: number, updatePatientDto: UpdatePatientDto) {
    if (updatePatientDto.document_type_id === documentType.FOREIGN_CARD)
      updatePatientDto.document_number = updatePatientDto.document_number.padStart(12, '0');

    const patient = await this.patientsRepository.findOneBy({ id, state: Not(BaseEntityState.DELETED) });

    if (!patient) return;

    patient.date_updated = getSystemDatetime();
    const updatedpatient = Object.assign(patient, updatePatientDto);
    await this.patientsRepository.save(updatedpatient);
  }

  async remove(id: number, forever: boolean = false) {
    const patient = await this.patientsRepository.findOneBy({ id });
    if (!patient) return;

    if (forever) {
      await this.patientsRepository.delete(id);
    } else {
      patient.state = BaseEntityState.DELETED;
      patient.date_deleted = getSystemDatetime();
      await this.patientsRepository.save(patient);
    }
  }

  async enable(id: number) {
    const patient = await this.patientsRepository.findOneBy({ id });
    if (!patient) return;

    patient.state = BaseEntityState.ENABLED;
    patient.date_updated = getSystemDatetime();

    await this.patientsRepository.save(patient);
  }

  async disable(id: number) {
    const patient = await this.patientsRepository.findOneBy({ id });
    if (!patient) return;

    patient.state = BaseEntityState.DISABLED;
    patient.date_updated = getSystemDatetime();

    await this.patientsRepository.save(patient);
  }

  async patientExists(id: number): Promise<boolean> {
    return await this.patientsRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
