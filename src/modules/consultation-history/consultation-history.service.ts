import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalConsultation } from '../medical-consultations/entities/medical-consultation.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ReqQuery } from './dto/req-query.dto';
import { User } from '../users/entities/user.entity';
import { RoleIds } from '../roles/entities/role.entity';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { UserAssigment } from '../users/entities/user-assignment.entity';
import { AttendanceRecord } from '../attendance-records/entities/attendance-record.entity';
import { ReqQuery as ReqQueryAssignmentsByClient } from 'src/modules/consultation-history/dto/req-query-clients-by-user.dto';
import { UsersService } from '../users/users.service';
import { ReqQueryFindAllUserAssigmentsClients } from './dto/req-query-user-assignments-clients.dto';
import { Campus } from '../campus/entities/campus.entity';
import { Client } from '../clients/entities/client.entity';
import { ReqQueryFindAllUserAssigmentsCampus } from './dto/req-query-user-assignments-campus.dto';

@Injectable()
export class ConsultationHistoriesService {
  constructor(
    @InjectRepository(MedicalConsultation) private medicalConsultationsRepository: Repository<MedicalConsultation>,
    @InjectRepository(UserAssigment) private userAssignmentsRepository: Repository<UserAssigment>,
    @InjectRepository(AttendanceRecord) private attendanceRecordsRepository: Repository<AttendanceRecord>,
    @InjectRepository(Campus) private campusRepository: Repository<Campus>,
    @InjectRepository(Client) private clientsRepository: Repository<Client>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(req_query: ReqQuery, user: User): Promise<PaginatedResult<MedicalConsultation>> | null {
    const skip = req_query.limit * req_query.page;

    let qb = this.medicalConsultationsRepository.createQueryBuilder('medical_consultations');

    qb.leftJoin('medical_consultations.campus', 'campus');
    qb.addSelect(['campus.id', 'campus.name']);

    qb.leftJoin('campus.client', 'client');
    qb.addSelect(['client.id', 'client.name']);

    qb.leftJoin('medical_consultations.user', 'user');
    qb.addSelect(['user.id', 'user.name', 'user.surname_first', 'user.surname_second', 'user.role_id']);

    qb.leftJoin('medical_consultations.patient', 'patient');
    qb.addSelect([
      'patient.id',
      'patient.name',
      'patient.surname_first',
      'patient.surname_second',
      'patient.patient_profile_id',
      'patient.other_profile',
      'patient.birthdate',
    ]);

    qb.leftJoin('patient.patient_profile', 'patient_profile');
    qb.addSelect(['patient_profile.id', 'patient_profile.name', 'patient_profile.description']);

    qb.leftJoin('medical_consultations.attendance_detail', 'attendance_detail');
    qb.addSelect(['attendance_detail.id', 'attendance_detail.consultation_type_id']);

    qb.leftJoin('attendance_detail.consultation_type', 'consultation_type');
    qb.addSelect(['consultation_type.id', 'consultation_type.name']);

    qb.leftJoin('medical_consultations.medical_diagnosis', 'medical_diagnosis');
    qb.addSelect([
      'medical_diagnosis.id',
      'medical_diagnosis.issued_medical_rest',
      'medical_diagnosis.medical_rest_start',
      'medical_diagnosis.medical_rest_end',
    ]);

    qb.where('medical_consultations.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.medical_rest != undefined) {
      qb.andWhere('medical_diagnosis.issued_medical_rest = :medical_rest', {
        medical_rest: req_query.medical_rest,
      });
    }

    if (req_query.consultation_type_id) {
      qb.andWhere('attendance_detail.consultation_type = :consultationType', {
        consultationType: req_query.consultation_type_id,
      });
    }

    if (req_query.patient_id) {
      qb.andWhere('patient.id = :patientId', { patientId: req_query.patient_id });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(medical_consultations.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: req_query.date_from,
        date_to: req_query.date_to,
      });
    } else qb.andWhere('CAST(medical_consultations.attendance_date AS DATE) = CAST(GETDATE() AS DATE)');

    if (user.role_id === RoleIds.HEALTH_TEAM) {
      const attendanceRecords = await this.attendanceRecordsRepository
        .createQueryBuilder('attendance_records')
        .where('attendance_records.user_id = :userId', { userId: user.id })
        .andWhere('CAST(attendance_records.day AS DATE) = CAST(GETDATE() AS DATE)')
        .getMany();

      const campusIds = attendanceRecords.map(attendanceRecord => attendanceRecord.campus_id)
      if (!campusIds.length) return null;

      // qb.andWhere('medical_consultations.user_id = :userId', { userId: user.id });
      qb.andWhere('medical_consultations.campus_id IN (:...campusIds)', { campusIds });
    } else if (user.role_id !== RoleIds.HEALTH_TEAM) {
      if (req_query.campus_id) {
        qb.andWhere('campus.id = :campusId', { campusId: req_query.campus_id });
      }

      if (req_query.client_id) {
        qb.andWhere('client.id = :clientId', { clientId: req_query.client_id });
      }

      if (user.role_id === RoleIds.CLIENT && !user.is_central) {
        const userAssignments = await this.findAllAssignmentsByClient(user.id);

        if (!userAssignments) return null;

        const campusIds = userAssignments.map(userAssignment => userAssignment.campus_id);

        qb.andWhere('medical_consultations.campus_id IN (:...campusIds)', { campusIds });
      }
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

  private async findAllAssignmentsByClient(userId: number): Promise<UserAssigment[]> | null {
    let qb = this.userAssignmentsRepository.createQueryBuilder('user_assignments');
    qb.leftJoin('user_assignments.campus', 'campus');
    qb.addSelect(['campus.id', 'campus.name']);

    qb.leftJoin('campus.client', 'client');
    qb.addSelect(['client.id', 'client.name']);

    qb.where('user_assignments.user_id = :userId', { userId });
    qb.andWhere('user_assignments.state != :state', { state: BaseEntityState.DELETED });

    const count = await qb.getCount();
    if (!count) return null;

    qb.distinctOn(['campus.id', 'client.id', 'group.id']).orderBy('campus.id').addOrderBy('client.id');

    const items = await qb.getMany();
    if (!items) return null;

    return items;
  }

  async findAllAsignmentsByClientPaginated(
    userId: number,
    req_query: ReqQueryAssignmentsByClient,
  ): Promise<PaginatedResult<UserAssigment>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.userAssignmentsRepository.createQueryBuilder('user_assignments');

    qb.leftJoin('user_assignments.campus', 'campus');
    qb.addSelect(['campus.id', 'campus.name']);

    qb.leftJoin('campus.client', 'client');
    qb.addSelect(['client.id', 'client.name']);

    qb.leftJoin('client.group', 'group');
    qb.addSelect(['group.id', 'group.name']);

    qb.where('user_assignments.user_id = :userId', { userId });
    qb.andWhere('user_assignments.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.campus_id) {
      qb.andWhere('campus.id = :campusId', { campusId: req_query.campus_id });
    }

    if (req_query.client_id) {
      qb.andWhere('client.id = :clientId', { clientId: req_query.client_id });
    }

    if (req_query.group_id) {
      qb.andWhere('group.id = :groupId', { groupId: req_query.group_id });
    }

    qb.distinctOn(['campus.id', 'client.id', 'group.id']).orderBy('campus.id').addOrderBy('client.id');

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

  async findAllUserAssigmentsClients(userId: number, req_query: ReqQueryFindAllUserAssigmentsClients) {
    let qb: SelectQueryBuilder<any>;
    let total: number;

    const skip = req_query.limit * req_query.page;
    const user = await this.usersService.findOne(userId);

    if (user.is_central) {
      qb = this.clientsRepository.createQueryBuilder('clients');
      qb.where('clients.state != :state', { state: BaseEntityState.DELETED });

      if (req_query.group_id) {
        qb.andWhere('clients.group_id = :groupId', { groupId: req_query.group_id });
      }

      if (req_query.query) {
        qb.andWhere('CONCAT(clients.name, clients.correlative) LIKE :pattern', { pattern: `%${req_query.query}%` });
      }

      qb.select(['clients.id id', 'clients.name name', 'clients.state state']);

      total = await qb.getCount();
    } else {
      qb = this.userAssignmentsRepository.createQueryBuilder('ua');
      qb.innerJoin('campus', 'campus', 'campus.id = ua.campus_id');
      qb.innerJoin('clients', 'clients', 'clients.id = campus.client_id');
      qb.where('ua.user_id = :userId', { userId });
      qb.andWhere('ua.state != :state', { state: BaseEntityState.DELETED });

      if (req_query.group_id) {
        qb.andWhere('clients.group_id = :groupId', { groupId: req_query.group_id });
      }

      if (req_query.query) {
        qb.andWhere('CONCAT(clients.name, clients.correlative) LIKE :pattern', { pattern: `%${req_query.query}%` });
      }

      let qbCount = qb;
      qbCount.select('COUNT(DISTINCT clients.id)', 'count');
      total = (await qbCount.getRawOne()).count * 1;

      qb.select(['clients.id id', 'clients.name name', 'clients.state state']);
      qb.distinct(true);
    }

    qb.offset(skip);
    qb.limit(req_query.limit);
    qb.orderBy(req_query.order_col, req_query.order_dir);

    const items = await qb.getRawMany();

    return {
      total,
      items,
      limit: req_query.limit,
      page: req_query.page,
    };
  }

  async findAllUserAssigmentsCampus(userId: number, req_query: ReqQueryFindAllUserAssigmentsCampus) {
    let qb: SelectQueryBuilder<any>;
    let total: number;

    const skip = req_query.limit * req_query.page;
    const user = await this.usersService.findOne(userId);

    if (user.is_central) {
      qb = this.campusRepository.createQueryBuilder('campus');
      qb.where('campus.state != :state', { state: BaseEntityState.DELETED });
      qb.innerJoin('clients', 'clients', 'clients.id = campus.client_id');

      if (req_query.client_id) {
        qb.andWhere('campus.client_id = :clientId', { clientId: req_query.client_id });
      }

      if (req_query.query) {
        qb.andWhere('CONCAT(campus.name, campus.correlative) LIKE :pattern', { pattern: `%${req_query.query}%` });
      }

      qb.select([
        'campus.id id',
        'campus.name name',
        'campus.state state',
        'clients.id client_id',
        'clients.name client_name',
      ]);

      total = await qb.getCount();
    } else {
      qb = this.userAssignmentsRepository.createQueryBuilder('ua');
      qb.innerJoin('campus', 'campus', 'campus.id = ua.campus_id');
      qb.innerJoin('clients', 'clients', 'clients.id = campus.client_id');
      qb.where('ua.user_id = :userId', { userId });
      qb.andWhere('ua.state != :state', { state: BaseEntityState.DELETED });

      if (req_query.client_id) {
        qb.andWhere('campus.client_id = :clientId', { clientId: req_query.client_id });
      }

      if (req_query.query) {
        qb.andWhere('CONCAT(campus.name, campus.correlative) LIKE :pattern', { pattern: `%${req_query.query}%` });
      }

      let qbCount = qb;
      qbCount.select('COUNT(DISTINCT campus.id)', 'count');
      total = (await qbCount.getRawOne()).count * 1;

      qb.select([
        'campus.id id',
        'campus.name name',
        'campus.state state',
        'clients.id client_id',
        'clients.name client_name',
      ]);
    }

    qb.offset(skip);
    qb.limit(req_query.limit);
    qb.orderBy(req_query.order_col, req_query.order_dir);

    const items = await qb.getRawMany();

    return {
      total,
      items,
      limit: req_query.limit,
      page: req_query.page,
    };
  }
}
