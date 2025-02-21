import { InjectRepository } from "@nestjs/typeorm";
import { PaginatedResult } from "src/common/interfaces/paginated-result.interface";
import { MedicalConsultation } from "src/modules/medical-consultations/entities/medical-consultation.entity";
import { Repository } from "typeorm";
import { ReqQuery } from "./dto/req-query.dto";
import { patientProfile } from "../patient-profile/entity/patient-profile.entity";
import { castBooleansToYesNo } from "src/common/helpers/generic";

export class ReportsService {
  constructor(@InjectRepository(MedicalConsultation) private medicalConsultationRepository: Repository<MedicalConsultation>) { }

  async findAllMedicalConsultations(req_query: ReqQuery): Promise<PaginatedResult<MedicalConsultation>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.medicalConsultationRepository.createQueryBuilder('medcon')
      .select([
        'medcon.id',
        'medcon.attendance_date',
        'medcon.attendance_time',
        'ca.id',
        'ca.name',
        'us.name',
        'us.colegiatura',
        'prof.name',
        'docty.name',
        'us.document_number',
        'us.surname_first',
        'us.surname_second',
        'pat.id',
        'pat.name',
        'pat.surname_first',
        'pat.surname_second',
        'pat.birthdate',
        'pdocty.name',
        'pat.document_number',
        'psex.name',
        'pprof.id',
        'pprof.name',
        'pat.other_profile',
        'paller.food_allergy',
        'paller.drug_allergy',
        'pmedh.surgical_history',
        'pmedh.hypertension',
        'pmedh.asthma',
        'pmedh.cancer',
        'pmedh.diabetes',
        'pmedh.epilepsy',
        'pmedh.psychological_condition',
        'pmedh.observation',
        'pmedh.others',
        'pmedh.others_description',
        'cty.name',
        'atd.id',
        'atdpla.name',
        'media.involves_mental_health',
        'biosys.name',
        'maidiag.id',
        'maidiag.code',
        'maidiag.name',
        'secdiag.id',
        'secdiag.code',
        'secdiag.name',
        'pres.id',
        'medi.name'
      ])
      .leftJoin('medcon.campus', 'ca')
      .leftJoin('medcon.user', 'us')
      .leftJoin('us.proffession', 'prof')
      .leftJoin('us.document_type', 'docty')
      .leftJoin('medcon.patient', 'pat')
      .leftJoin('pat.document_type', 'pdocty')
      .leftJoin('pat.sex', 'psex')
      .leftJoin('pat.patient_profile', 'pprof')
      .leftJoin('pat.allergy', 'paller')
      .leftJoin('pat.medical_history', 'pmedh')
      .leftJoin('medcon.attendance_detail', 'atd')
      .leftJoin('atd.consultation_type', 'cty')
      .leftJoin('atd.attendance_place', 'atdpla')
      .leftJoin('medcon.medical_diagnosis', 'media')
      .leftJoin('media.biological_system', 'biosys')
      .leftJoin('media.main_diagnosis', 'maidiag')
      .leftJoin('media.secondary_diagnosis', 'secdiag')
      .leftJoin('medcon.prescriptions', 'pres')
      .leftJoin('pres.medicine', 'medi');

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(medcon.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: req_query.date_from,
        date_to: req_query.date_to
      })
    }

    const total = await qb.getCount();

    qb.skip(skip)
    qb.take(req_query.limit)
    qb.orderBy(req_query.order_col, req_query.order_dir);

    let items = await qb.getMany();

    items.forEach(item => {
      castBooleansToYesNo(item);

      if (item.patient.patient_profile && item.patient.patient_profile.id === patientProfile.OTHER) {
        item.patient.patient_profile.name = item.patient.other_profile;
      }
    });

    return {
      total,
      items,
      limit: req_query.limit,
      page: req_query.page,
    };
  }

  async exportAllMedicalConsultations(req_query: ReqQuery): Promise<MedicalConsultation[]> {
    let qb = this.medicalConsultationRepository.createQueryBuilder('medcon')
      .select([
        'medcon.id',
        'medcon.attendance_date',
        // 'medcon.attendance_time',
        'ca.id',
        'ca.name',
        'us.name',
        'us.colegiatura',
        'prof.name',
        'docty.name',
        'us.document_number',
        'us.surname_first',
        'us.surname_second',
        'pat.id',
        'pat.name',
        'pat.surname_first',
        'pat.surname_second',
        'pat.birthdate',
        'pdocty.name',
        'pat.document_number',
        'psex.name',
        'pprof.id',
        'paller.food_allergy',
        'paller.drug_allergy',
        'pmedh.surgical_history',
        'pmedh.observation',
        'pmedh.others_description',
        'cty.name',
        'atd.id',
        'atdpla.name',
        'biosys.name',
        'maidiag.id',
        'maidiag.code',
        'maidiag.name',
        'secdiag.id',
        'secdiag.code',
        'secdiag.name',
        'pres.id',
        'medi.name'
      ])
      .addSelect("CONVERT(VARCHAR(10), medcon.attendance_time)", 'medcon_attendance_time')
      .addSelect("CASE WHEN pprof.id = 3 THEN pat.other_profile ELSE pprof.name END", 'pprof_name')
      .addSelect("CASE WHEN pmedh.hypertension = 1 THEN 'SI' ELSE 'NO' END", 'pmedh_hypertension')
      .addSelect("CASE WHEN pmedh.asthma = 1 THEN 'SI' ELSE 'NO' END", 'pmedh_asthma')
      .addSelect("CASE WHEN pmedh.cancer = 1 THEN 'SI' ELSE 'NO' END", 'pmedh_cancer')
      .addSelect("CASE WHEN pmedh.diabetes = 1 THEN 'SI' ELSE 'NO' END", 'pmedh_diabetes')
      .addSelect("CASE WHEN pmedh.epilepsy = 1 THEN 'SI' ELSE 'NO' END", 'pmedh_epilepsy')
      .addSelect("CASE WHEN pmedh.others = 1 THEN 'SI' ELSE 'NO' END", 'pmedh_others')
      .addSelect("CASE WHEN pmedh.psychological_condition = 1 THEN 'SI' ELSE 'NO' END", 'pmedh_psychological_condition')
      .addSelect("CASE WHEN media.involves_mental_health = 1 THEN 'SI' ELSE 'NO' END", 'media_involves_mental_health')
      .leftJoin('medcon.campus', 'ca')
      .leftJoin('medcon.user', 'us')
      .leftJoin('us.proffession', 'prof')
      .leftJoin('us.document_type', 'docty')
      .leftJoin('medcon.patient', 'pat')
      .leftJoin('pat.document_type', 'pdocty')
      .leftJoin('pat.sex', 'psex')
      .leftJoin('pat.patient_profile', 'pprof')
      .leftJoin('pat.allergy', 'paller')
      .leftJoin('pat.medical_history', 'pmedh')
      .leftJoin('medcon.attendance_detail', 'atd')
      .leftJoin('atd.consultation_type', 'cty')
      .leftJoin('atd.attendance_place', 'atdpla')
      .leftJoin('medcon.medical_diagnosis', 'media')
      .leftJoin('media.biological_system', 'biosys')
      .leftJoin('media.main_diagnosis', 'maidiag')
      .leftJoin('media.secondary_diagnosis', 'secdiag')
      .leftJoin('medcon.prescriptions', 'pres')
      .leftJoin('pres.medicine', 'medi');

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(medcon.attendance_date AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: req_query.date_from,
        date_to: req_query.date_to
      })
    }

    let items = await qb.getRawMany();
    console.log(items)

    return items;
  }
}