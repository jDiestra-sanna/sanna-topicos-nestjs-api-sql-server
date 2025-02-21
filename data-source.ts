import { Token } from 'src/auth/token.entity';
import { File } from 'src/files/entities/file.entity';
import { ArticleGroups } from 'src/modules/article-groups/entities/article-groups.entity';
import { AttendancePlace } from 'src/modules/attendance-places/entities/attendance-place.entity';
import { AttendanceRecord } from 'src/modules/attendance-records/entities/attendance-record.entity';
import { BiologicalSystem } from 'src/modules/biological-systems/entities/biological-system.entity';
import { Campus } from 'src/modules/campus/entities/campus.entity';
import { Client } from 'src/modules/clients/entities/client.entity';
import { ConsultationType } from 'src/modules/consultation-types/entities/consultation-type.entity';
import { CostCenter } from 'src/modules/cost-centers/entities/cost-center.entity';
import { DiagnosisType } from 'src/modules/diagnoses/entities/diagnosis-type.entity';
import { Diagnosis } from 'src/modules/diagnoses/entities/diagnosis.entity';
import { DocumentType } from 'src/modules/document-types/entities/document-types.entity';
import { FileType } from 'src/modules/file-types/entities/file-type.entity';
import { FormFactor } from 'src/modules/form-factor/entities/form-factor.entity';
import { Group } from 'src/modules/groups/entities/group.entity';
import { IllnessQuantityType } from 'src/modules/illness-quantity-types/entities/illness-quantity-type.entity';
import { LogTarget } from 'src/modules/logs/entities/log-target';
import { LogType } from 'src/modules/logs/entities/log-type.dto';
import { Log } from 'src/modules/logs/entities/log.entity';
import { MedicalCalendarDay } from 'src/modules/medical-calendars/entities/medical-calendar-days.entity';
import { MedicalCalendar } from 'src/modules/medical-calendars/entities/medical-calendar.entity';
import { Allergy } from 'src/modules/medical-consultations/allergies/entities/allergies.entity';
import { AttendanceDetail } from 'src/modules/medical-consultations/attendance-details/entities/attendance-detail.entity';
import { MedicalConsultation } from 'src/modules/medical-consultations/entities/medical-consultation.entity';
import { MedicalDiagnosis } from 'src/modules/medical-consultations/medical-diagnoses/entity/medical-diagnosis.entity';
import { MedicalHistory } from 'src/modules/medical-consultations/medical-histories/entities/medical-history.entity';
import { Patient } from 'src/modules/medical-consultations/patients/entities/patient.entity';
import { Prescription } from 'src/modules/medical-consultations/prescriptions/entities/prescription.entity';
import { Medicine } from 'src/modules/medicines/entities/medicines.entity';
import { Module } from 'src/modules/modules/entities/module.entity';
import { PatientProfile } from 'src/modules/patient-profile/entity/patient-profile.entity';
import { Proffesion } from 'src/modules/proffesions/entities/proffesion.entity';
import { ProtocolFile } from 'src/modules/protocols/entities/protocol-files.entity';
import { ProtocolType } from 'src/modules/protocols/entities/protocol-type.entity';
import { Protocol } from 'src/modules/protocols/entities/protocol.entity';
import { Perms } from 'src/modules/roles/entities/perms.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Session } from 'src/modules/sessions/entities/session.entity';
import { Setting } from 'src/modules/settings/entities/setting.entity';
import { Sex } from 'src/modules/sexes/entities/sex.entity';
import { SubProtocolFile } from 'src/modules/subprotocols/entities/subprotocol-files.entity';
import { SubProtocol } from 'src/modules/subprotocols/entities/subprotocol.entity';
import { UbigeoPeruDeparment } from 'src/modules/ubigeo/entities/departments.entity';
import { UbigeoPeruDistrict } from 'src/modules/ubigeo/entities/district.entity';
import { UbigeoPeruProvince } from 'src/modules/ubigeo/entities/province.entity';
import { UserType } from 'src/modules/users/entities/type-user.entity';
import { UserAssigment } from 'src/modules/users/entities/user-assignment.entity';
import { UserFile } from 'src/modules/users/entities/user-file.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { ClientLevel } from 'src/modules/client-levels/entities/client-level.entity';
import 'dotenv/config'
import { CampusCondition } from 'src/modules/campus-conditions/entities/campus-condition.entity';
import { CampusSchedule } from 'src/modules/campus-schedules/entities/campus-schedule.entity';

const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: [
    CampusSchedule,
    CampusCondition,
    ClientLevel,
    Setting,
    ArticleGroups,
    FormFactor,
    Prescription,
    MedicalConsultation,
    Patient,
    DocumentType,
    User,
    Role,
    Module,
    UserType,
    Perms,
    UbigeoPeruDeparment,
    UbigeoPeruProvince,
    UbigeoPeruDistrict,
    Campus,
    Client,
    Group,
    Protocol,
    ProtocolType,
    ProtocolFile,
    File,
    SubProtocol,
    SubProtocolFile,
    Sex,
    PatientProfile,
    Allergy,
    MedicalHistory,
    AttendanceDetail,
    ConsultationType,
    AttendancePlace,
    IllnessQuantityType,
    MedicalDiagnosis,
    Diagnosis,
    Proffesion,
    DiagnosisType,
    BiologicalSystem,
    MedicalCalendar,
    MedicalCalendarDay,
    UserAssigment,
    AttendanceRecord,
    Session,
    Log,
    LogType,
    LogTarget,
    Token,
    UserFile,
    FileType,
    CostCenter,
    Medicine,
    Notification,
  ],
  // entities: ["src/**/*.entity.ts"],
  migrations: ['migrations/*.ts'],
  options: {
    trustServerCertificate: true,
    encrypt: false
  },
  schema: 'sanna'
});

export default AppDataSource;
