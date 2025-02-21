import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalConsultation } from './entities/medical-consultation.entity';
import { Repository } from 'typeorm';
import { CreateMedicalConsultationDto } from './dto/create-medical-consultation.dto';
import { ReqQuery } from './dto/req-query.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { MedicalCalendarDay } from '../medical-calendars/entities/medical-calendar-days.entity';

@Injectable()
export class MedicalConsultationsService {
  constructor(
    @InjectRepository(MedicalConsultation) private medicalConsultationsRepository: Repository<MedicalConsultation>,
    @InjectRepository(MedicalCalendarDay)
    private medicalCalendarDaysRepository: Repository<MedicalCalendarDay>,
  ) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<MedicalConsultation>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.medicalConsultationsRepository.createQueryBuilder('medical_consultations');

    qb.leftJoinAndSelect('medical_consultations.patient', 'patient');
    qb.leftJoinAndSelect('patient.document_type', 'document_type');
    qb.leftJoinAndSelect('patient.patient_profile', 'patient_profile');
    qb.leftJoinAndSelect('patient.allergy', 'allergy');
    qb.leftJoinAndSelect('patient.medical_history', 'medical_history');

    qb.leftJoinAndSelect('medical_consultations.attendance_detail', 'attendance_detail');
    qb.leftJoinAndSelect('attendance_detail.consultation_type', 'consultation_type');
    qb.leftJoinAndSelect('attendance_detail.attendance_place', 'attendance_place');
    qb.leftJoinAndSelect('attendance_detail.illness_quantity_type', 'illness_quantity_type');

    qb.leftJoinAndSelect('medical_consultations.medical_diagnosis', 'medical_diagnosis');
    qb.leftJoinAndSelect('medical_diagnosis.main_diagnosis', 'main_diagnosis');
    qb.leftJoinAndSelect('medical_diagnosis.secondary_diagnosis', 'secondary_diagnosis');
    qb.leftJoinAndSelect('medical_diagnosis.biological_system', 'biological_system');

    qb.leftJoinAndSelect('medical_consultations.prescriptions', 'prescriptions');
    qb.leftJoinAndSelect('prescriptions.medicine', 'medicine');

    qb.where('medical_consultations.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.patient_id) {
      qb.andWhere('medical_consultations.patient_id = :patient_id', { patient_id: req_query.patient_id });
    }

    if (req_query.query) {
      qb.andWhere(
        'CONCAT(patient.name, patient.surname_first, patient.surname_second, attendance_detail.consultation_type, medical_diagnosis.issued_medical_rest, medical_consultations.attendance_date) LIKE :pattern',
        {
          pattern: `%${req_query.query}%`,
        },
      );
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(medical_consultations.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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

  async findOne(medicalConsultationId: number) {
    const medicalConsultation = await this.medicalConsultationsRepository.findOne({
      where: { id: medicalConsultationId },
      relations: [
        'patient',
        'patient.document_type',
        'patient.sex',
        'patient.patient_profile',
        'patient.allergy',
        'patient.medical_history',
        'attendance_detail',
        'attendance_detail.consultation_type',
        'attendance_detail.attendance_place',
        'attendance_detail.illness_quantity_type',
        'medical_diagnosis',
        'medical_diagnosis.main_diagnosis',
        'medical_diagnosis.secondary_diagnosis',
        'medical_diagnosis.biological_system',
        'prescriptions',
        'prescriptions.medicine',
        'campus',
      ],
    });

    if (!medicalConsultation) return null;
    return medicalConsultation;
  }

  async create(userId: number, createMedicalConsultationDto: CreateMedicalConsultationDto) {
    const newMedicalConsultation = await this.medicalConsultationsRepository.save({
      user_id: userId,
      ...createMedicalConsultationDto,
    });

    if (!newMedicalConsultation) return null;

    return newMedicalConsultation;
  }

  async medicalConsultationExists(id: number) {
    return await this.medicalConsultationsRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
