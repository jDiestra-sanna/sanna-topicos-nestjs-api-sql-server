import { BaseEntityState } from 'src/common/entities/base.entity';
import { BiologicalSystem } from '../biological-systems/entities/biological-system.entity';
import { consultationType } from '../consultation-types/entities/consultation-type.entity';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalConsultation } from '../medical-consultations/entities/medical-consultation.entity';
import { PatientProfile } from '../patient-profile/entity/patient-profile.entity';
import { Repository } from 'typeorm';
import { ReqQuery } from './dto/req-query.dto';
import { Client } from '../clients/entities/client.entity';
import { CampusConditionIds } from '../campus-conditions/entities/campus-condition.entity';
import { RoleIds } from '../roles/entities/role.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(MedicalConsultation)
    private medicalConsultationRepository: Repository<MedicalConsultation>,
    @InjectRepository(PatientProfile)
    private patientProfileRepository: Repository<PatientProfile>,
    @InjectRepository(BiologicalSystem)
    private biologicalSystemRepository: Repository<BiologicalSystem>,
    @InjectRepository(Client) private clientsRepository: Repository<Client>,
  ) {}

  async getDashboardData(query: ReqQuery) {
    const topicsOpened = await this.getTopicsOpened(query)
    const attendedPersons = await this.getAttendedPersons(query);
    const mentalHealthConsultations = await this.getMentalHealthConsultations(query);
    const rotationMedications = await this.getRotationMedications(query, 5);
    const consultationsByPatientProfile = await this.getConsultationsByPatientProfile(query);
    const consultationsByBiologicalSystem = await this.getConsultationsByBiologicalSystem(query);
    const consultationsPerDay = await this.getConsultationsPerDay(query);
    const epidemiologicalProfile = await this.getEpidemiologicalProfile(query);

    const consultationsDefaultRsp = { total: 0, totalPreviousDay: 0, percentageVsPreviousDay: 0 };
    let standardConsultations = consultationsDefaultRsp;
    let emergencyConsultations = consultationsDefaultRsp;

    if (query.consultation_type_id) {
      if (query.consultation_type_id === consultationType.STANDARD) {
        standardConsultations = await this.getConsultationCount(query);
      }

      if (query.consultation_type_id === consultationType.EMERGENCY) {
        emergencyConsultations = await this.getConsultationCount(query);
      }
    } else {
      standardConsultations = await this.getConsultationCount({
        ...query,
        consultation_type_id: consultationType.STANDARD,
      });
      emergencyConsultations = await this.getConsultationCount({
        ...query,
        consultation_type_id: consultationType.EMERGENCY,
      });
    }

    return {
      topicsOpened,
      attendedPersons,
      standardConsultations,
      emergencyConsultations,
      mentalHealthConsultations,
      rotationMedications,
      consultationsByPatientProfile,
      consultationsByBiologicalSystem,
      consultationsPerDay,
      epidemiologicalProfile,
    };
  }

  async getTopicsOpened(query: ReqQuery) {
    let qbTopics = this.clientsRepository
      .createQueryBuilder('cl')
      .select('COUNT(ca.id) total')
      .innerJoin('cl.campuses', 'ca')
      .where('cl.state != :clientState', { clientState: BaseEntityState.DELETED })
      .andWhere('ca.state != :campusState', { campusState: BaseEntityState.DELETED });

    if (!query.is_central && query.role_id === RoleIds.CLIENT) {
      qbTopics.innerJoin('ca.user_assignments', 'ua');
      qbTopics.andWhere('ua.user_id = :userId', { userId: query.user_id });
      qbTopics.andWhere('ua.state = :uaState', { uaState: BaseEntityState.ENABLED });
    }

    if (query.campus_id) {
      qbTopics.andWhere('ca.id = :campus_id', { campus_id: query.campus_id });
    }

    if (query.client_id) {
      qbTopics.andWhere('cl.id = :client_id', { client_id: query.client_id });
    }

    let qbTopicsOpened = qbTopics.clone();
    qbTopicsOpened.andWhere('ca.condition_id = :campusOperative', {
      campusOperative: CampusConditionIds.OPERATIVE,
    });

    let total = await qbTopics.getRawOne();
    total = +total.total;
    let opens = await qbTopicsOpened.getRawOne();
    opens = +opens.total;
    return { total, opens };
  }

  async getAttendedPersons(query: ReqQuery) {
    let qb = this.medicalConsultationRepository.createQueryBuilder('mc');
    qb.select('COUNT(DISTINCT mc.patient_id) count');
    qb.innerJoin('attendance_details', 'ad', 'ad.medical_consultation_id = mc.id');
    qb.innerJoin('campus', 'ca', 'ca.id = mc.campus_id');
    qb.innerJoin('clients', 'cl', 'cl.id = ca.client_id');
    qb.where('mc.state = :state', { state: BaseEntityState.ENABLED });

    if (!query.is_central && query.role_id === RoleIds.CLIENT) {
      qb.innerJoin('ca.user_assignments', 'ua');
      qb.andWhere('ua.user_id = :userId', { userId: query.user_id });
      qb.andWhere('ua.state = :uaState', { uaState: BaseEntityState.ENABLED });
    }

    if (query.consultation_type_id) {
      qb.andWhere('ad.consultation_type_id = :consultation_type_id', {
        consultation_type_id: query.consultation_type_id,
      });
    }

    if (query.campus_id) {
      qb.andWhere('ca.id = :campus_id', { campus_id: query.campus_id });
    }

    if (query.client_id) {
      qb.andWhere('cl.id = :client_id', { client_id: query.client_id });
    }

    let qbVsPreviousDay = qb.clone();

    if (query.date_from && query.date_to) {
      qb.andWhere('CAST(mc.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: query.date_from,
        date_to: query.date_to,
      });

      const previousDay = DateTime.fromFormat(query.date_from, 'yyyy-MM-dd').minus({ days: 1 }).toFormat('yyyy-MM-dd');

      qbVsPreviousDay.andWhere('CAST(mc.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: previousDay,
        date_to: previousDay,
      });
    }

    const totalResult = await qb.getRawOne();
    const qbVsPreviousDayResult = await qbVsPreviousDay.getRawOne();
    const total = +totalResult.count;
    const totalPreviousDay = +qbVsPreviousDayResult.count;
    const percentageVsPreviousDay = Math.round(((total - totalPreviousDay) / (totalPreviousDay || 1)) * 100);

    return { total, totalPreviousDay, percentageVsPreviousDay };
  }

  async getConsultationCount(query: ReqQuery) {
    let qb = this.medicalConsultationRepository.createQueryBuilder('mc');
    qb.select('COUNT(mc.id) count');
    qb.innerJoin('attendance_details', 'ad', 'ad.medical_consultation_id = mc.id');
    qb.innerJoin('campus', 'ca', 'ca.id = mc.campus_id');
    qb.innerJoin('clients', 'cl', 'cl.id = ca.client_id');
    qb.where('mc.state = :state', { state: BaseEntityState.ENABLED });

        if (!query.is_central && query.role_id === RoleIds.CLIENT) {
      qb.innerJoin('ca.user_assignments', 'ua');
      qb.andWhere('ua.user_id = :userId', { userId: query.user_id });
      qb.andWhere('ua.state = :uaState', { uaState: BaseEntityState.ENABLED });
    }

    if (query.consultation_type_id) {
      qb.andWhere('ad.consultation_type_id = :consultation_type_id', {
        consultation_type_id: query.consultation_type_id,
      });
    }

    if (query.campus_id) {
      qb.andWhere('ca.id = :campus_id', { campus_id: query.campus_id });
    }

    if (query.client_id) {
      qb.andWhere('cl.id = :client_id', { client_id: query.client_id });
    }

    let qbVsPreviousDay = qb.clone();

    if (query.date_from && query.date_to) {
      qb.andWhere('CAST(mc.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: query.date_from,
        date_to: query.date_to,
      });

      const previousDay = DateTime.fromFormat(query.date_from, 'yyyy-MM-dd').minus({ days: 1 }).toFormat('yyyy-MM-dd');

      qbVsPreviousDay.andWhere('CAST(mc.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: previousDay,
        date_to: previousDay,
      });
    }

    const totalResult = await qb.getRawOne();
    const qbVsPreviousDayResult = await qbVsPreviousDay.getRawOne();
    const total = +totalResult.count;
    const totalPreviousDay = +qbVsPreviousDayResult.count;
    const percentageVsPreviousDay = Math.round(((total - totalPreviousDay) / (totalPreviousDay || 1)) * 100);

    return { total, totalPreviousDay, percentageVsPreviousDay };
  }

  async getMentalHealthConsultations(query: ReqQuery) {
    let qb = this.medicalConsultationRepository.createQueryBuilder('mc');
    qb.select('COUNT(mc.patient_id) count');
    qb.innerJoin('attendance_details', 'ad', 'ad.medical_consultation_id = mc.id');
    qb.innerJoin('medical_diagnoses', 'md', 'md.medical_consultation_id = mc.id');
    qb.innerJoin('campus', 'ca', 'ca.id = mc.campus_id');
    qb.innerJoin('clients', 'cl', 'cl.id = ca.client_id');
    qb.where('mc.state = :state', { state: BaseEntityState.ENABLED });
    qb.andWhere('md.involves_mental_health = 1');

    if (!query.is_central && query.role_id === RoleIds.CLIENT) {
      qb.innerJoin('ca.user_assignments', 'ua');
      qb.andWhere('ua.user_id = :userId', { userId: query.user_id });
      qb.andWhere('ua.state = :uaState', { uaState: BaseEntityState.ENABLED });
    }

    if (query.consultation_type_id) {
      qb.andWhere('ad.consultation_type_id = :consultation_type_id', {
        consultation_type_id: query.consultation_type_id,
      });
    }

    if (query.campus_id) {
      qb.andWhere('ca.id = :campus_id', { campus_id: query.campus_id });
    }

    if (query.client_id) {
      qb.andWhere('cl.id = :client_id', { client_id: query.client_id });
    }

    let qbVsPreviousDay = qb.clone();

    if (query.date_from && query.date_to) {
      qb.andWhere('CAST(mc.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: query.date_from,
        date_to: query.date_to,
      });

      const previousDay = DateTime.fromFormat(query.date_from, 'yyyy-MM-dd').minus({ days: 1 }).toFormat('yyyy-MM-dd');

      qbVsPreviousDay.andWhere('CAST(mc.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: previousDay,
        date_to: previousDay,
      });
    }

    const totalResult = await qb.getRawOne();
    const qbVsPreviousDayResult = await qbVsPreviousDay.getRawOne();
    const total = +totalResult.count;
    const totalPreviousDay = +qbVsPreviousDayResult.count;
    const percentageVsPreviousDay = Math.round(((total - totalPreviousDay) / (totalPreviousDay || 1)) * 100);

    return { total, totalPreviousDay, percentageVsPreviousDay };
  }

  async getRotationMedications(query: ReqQuery, top: number = null) {
    let qb = this.medicalConsultationRepository.createQueryBuilder('mc');
    qb.select(['me.id id', 'me.name name', 'COUNT(pr.medicine_id) count']);
    qb.innerJoin('attendance_details', 'ad', 'ad.medical_consultation_id = mc.id');
    qb.innerJoin('prescriptions', 'pr', 'pr.medical_consultation_id = mc.id');
    qb.innerJoin('medicines', 'me', 'me.id = pr.medicine_id');
    qb.innerJoin('campus', 'ca', 'ca.id = mc.campus_id');
    qb.innerJoin('clients', 'cl', 'cl.id = ca.client_id');
    qb.where('mc.state = :state', { state: BaseEntityState.ENABLED });
    qb.groupBy('pr.medicine_id, me.id, me.name'); 
    qb.orderBy('count', 'DESC');

        if (!query.is_central && query.role_id === RoleIds.CLIENT) {
      qb.innerJoin('ca.user_assignments', 'ua');
      qb.andWhere('ua.user_id = :userId', { userId: query.user_id });
      qb.andWhere('ua.state = :uaState', { uaState: BaseEntityState.ENABLED });
    }

    if (top) qb.limit(top);

    if (query.consultation_type_id) {
      qb.andWhere('ad.consultation_type_id = :consultation_type_id', {
        consultation_type_id: query.consultation_type_id,
      });
    }

    if (query.campus_id) {
      qb.andWhere('ca.id = :campus_id', { campus_id: query.campus_id });
    }

    if (query.client_id) {
      qb.andWhere('cl.id = :client_id', { client_id: query.client_id });
    }

    if (query.date_from && query.date_to) {
      qb.andWhere('CAST(mc.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: query.date_from,
        date_to: query.date_to,
      });
    }

    const items = await qb.getRawMany();

    return items.map(i => ({ ...i, count: +i.count }));
  }

  async getConsultationsByPatientProfile(query: ReqQuery) {
    let qb = this.patientProfileRepository.createQueryBuilder('pp');
    qb.select(['pp.id id', 'pp.name name', 'COUNT(mc.id) count']);
    qb.leftJoin('patients', 'pa', 'pa.patient_profile_id = pp.id');
    qb.leftJoin('medical_consultations', 'mc', 'mc.patient_id = pa.id');
    qb.leftJoin('attendance_details', 'ad', 'ad.medical_consultation_id = mc.id');
    qb.leftJoin('campus', 'ca', 'ca.id = mc.campus_id');
    qb.leftJoin('clients', 'cl', 'cl.id = ca.client_id');
    qb.where('mc.state = :state', { state: BaseEntityState.ENABLED });

        if (!query.is_central && query.role_id === RoleIds.CLIENT) {
      qb.innerJoin('ca.user_assignments', 'ua');
      qb.andWhere('ua.user_id = :userId', { userId: query.user_id });
      qb.andWhere('ua.state = :uaState', { uaState: BaseEntityState.ENABLED });
    }

    if (query.consultation_type_id) {
      qb.andWhere('ad.consultation_type_id = :consultation_type_id', {
        consultation_type_id: query.consultation_type_id,
      });
    }

    if (query.campus_id) {
      qb.andWhere('ca.id = :campus_id', { campus_id: query.campus_id });
    }

    if (query.client_id) {
      qb.andWhere('cl.id = :client_id', { client_id: query.client_id });
    }

    if (query.date_from && query.date_to) {
      qb.andWhere('CAST(mc.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: query.date_from,
        date_to: query.date_to,
      });
    }

    qb.orWhere('mc.state is null');
    qb.groupBy('pp.id, pp.name');
    qb.orderBy('count', 'DESC');

    const items = await qb.getRawMany();

    return items.map(i => ({ ...i, count: +i.count }));
  }

  async getConsultationsByBiologicalSystem(query: ReqQuery) {
    let qb = this.biologicalSystemRepository.createQueryBuilder('bs');
    qb.select(['bs.id id', 'bs.name name', 'COUNT(mc.id) count']);
    qb.innerJoin('medical_diagnoses', 'md', 'md.biological_system_id = bs.id');
    qb.innerJoin('medical_consultations', 'mc', 'mc.id = md.medical_consultation_id');
    qb.innerJoin('attendance_details', 'ad', 'ad.medical_consultation_id = mc.id');
    qb.innerJoin('campus', 'ca', 'ca.id = mc.campus_id');
    qb.innerJoin('clients', 'cl', 'cl.id = ca.client_id');
    qb.where('mc.state = :state', { state: BaseEntityState.ENABLED });

        if (!query.is_central && query.role_id === RoleIds.CLIENT) {
      qb.innerJoin('ca.user_assignments', 'ua');
      qb.andWhere('ua.user_id = :userId', { userId: query.user_id });
      qb.andWhere('ua.state = :uaState', { uaState: BaseEntityState.ENABLED });
    }

    if (query.consultation_type_id) {
      qb.andWhere('ad.consultation_type_id = :consultation_type_id', {
        consultation_type_id: query.consultation_type_id,
      });
    }

    if (query.campus_id) {
      qb.andWhere('ca.id = :campus_id', { campus_id: query.campus_id });
    }

    if (query.client_id) {
      qb.andWhere('cl.id = :client_id', { client_id: query.client_id });
    }

    if (query.date_from && query.date_to) {
      qb.andWhere('CAST(mc.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: query.date_from,
        date_to: query.date_to,
      });
    }

    qb.groupBy('bs.id, bs.name');
    qb.orderBy('count', 'DESC');

    let biologicalSystemListCount = await qb.getRawMany();
    const biologicalSystems = await this.biologicalSystemRepository
      .createQueryBuilder()
      .select(['id', 'name', "'0' count"])
      .orderBy('name')
      .getRawMany();

    // biologicalSystems.map(i => {
    //   const found = biologicalSystemListCount.find(j => j.id === i.id);
    //   if (found) i.count = found.count;
    //   i.count = +i.count;
    // });

    const biologicalSystemsResidual = biologicalSystems.filter(
      i => !biologicalSystemListCount.find(j => j.id === i.id),
    );
    biologicalSystemListCount = [...biologicalSystemListCount, ...biologicalSystemsResidual];

    return biologicalSystemListCount.map(i => ({ ...i, count: +i.count }));
  }

  async getConsultationsPerDay(query: ReqQuery) {
    let qb = this.medicalConsultationRepository.createQueryBuilder('mc');
    qb.select(['mc.attendance_date AS attendance_date', 'COUNT(mc.id) AS count']);
    qb.innerJoin('attendance_details', 'ad', 'ad.medical_consultation_id = mc.id');
    qb.innerJoin('campus', 'ca', 'ca.id = mc.campus_id');
    qb.innerJoin('clients', 'cl', 'cl.id = ca.client_id');
    qb.where('mc.state = :state', { state: BaseEntityState.ENABLED });
    qb.groupBy('mc.attendance_date');
    qb.orderBy('mc.attendance_date', 'ASC');

        if (!query.is_central && query.role_id === RoleIds.CLIENT) {
      qb.innerJoin('ca.user_assignments', 'ua');
      qb.andWhere('ua.user_id = :userId', { userId: query.user_id });
      qb.andWhere('ua.state = :uaState', { uaState: BaseEntityState.ENABLED });
    }

    if (query.consultation_type_id) {
      qb.andWhere('ad.consultation_type_id = :consultation_type_id', {
        consultation_type_id: query.consultation_type_id,
      });
    }

    if (query.campus_id) {
      qb.andWhere('ca.id = :campus_id', { campus_id: query.campus_id });
    }

    if (query.client_id) {
      qb.andWhere('cl.id = :client_id', { client_id: query.client_id });
    }

    if (query.date_from && query.date_to) {
      qb.andWhere('CAST(mc.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: query.date_from,
        date_to: query.date_to,
      });
    }

    const items = await qb.getRawMany();

    return items.map(i => ({ ...i, attendance_date: i.attendance_date.toLocaleDateString(), count: +i.count }));
  }

  async getEpidemiologicalProfile(query: ReqQuery) {
    let qb = this.medicalConsultationRepository.createQueryBuilder('mc');
    qb.select(['di.id id', 'di.name name', 'COUNT(mc.id) count']);
    qb.innerJoin('medical_diagnoses', 'md', 'md.medical_consultation_id = mc.id');
    qb.innerJoin('diagnoses', 'di', 'di.id = md.main_diagnosis_id');
    qb.innerJoin('attendance_details', 'ad', 'ad.medical_consultation_id = mc.id');
    qb.innerJoin('campus', 'ca', 'ca.id = mc.campus_id');
    qb.innerJoin('clients', 'cl', 'cl.id = ca.client_id');
    qb.where('mc.state = :state', { state: BaseEntityState.ENABLED });
    qb.groupBy('di.id, di.name');
    qb.orderBy('count', 'DESC');
    qb.limit(5);

        if (!query.is_central && query.role_id === RoleIds.CLIENT) {
      qb.innerJoin('ca.user_assignments', 'ua');
      qb.andWhere('ua.user_id = :userId', { userId: query.user_id });
      qb.andWhere('ua.state = :uaState', { uaState: BaseEntityState.ENABLED });
    }

    if (query.consultation_type_id) {
      qb.andWhere('ad.consultation_type_id = :consultation_type_id', {
        consultation_type_id: query.consultation_type_id,
      });
    }

    if (query.campus_id) {
      qb.andWhere('ca.id = :campus_id', { campus_id: query.campus_id });
    }

    if (query.client_id) {
      qb.andWhere('cl.id = :client_id', { client_id: query.client_id });
    }

    if (query.date_from && query.date_to) {
      qb.andWhere('CAST(mc.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: query.date_from,
        date_to: query.date_to,
      });
    }

    const items = await qb.getRawMany();

    return items.map(i => ({ ...i, count: +i.count }));
  }
}
