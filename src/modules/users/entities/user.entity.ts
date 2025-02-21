import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { UserType } from './type-user.entity';
import { UbigeoPeruDeparment } from 'src/modules/ubigeo/entities/departments.entity';
import { UbigeoPeruProvince } from 'src/modules/ubigeo/entities/province.entity';
import { UbigeoPeruDistrict } from 'src/modules/ubigeo/entities/district.entity';
import { File } from 'src/files/entities/file.entity';
import { DocumentType } from 'src/modules/document-types/entities/document-types.entity';
import { Session } from 'src/modules/sessions/entities/session.entity';
import { Log } from 'src/modules/logs/entities/log.entity';
import { AttendanceRecord } from 'src/modules/attendance-records/entities/attendance-record.entity';
import { MedicalCalendar } from 'src/modules/medical-calendars/entities/medical-calendar.entity';
import { Token } from 'src/auth/token.entity';
import { UserAssigment } from './user-assignment.entity';
import { UserFile } from './user-file.entity';
import { Proffesion } from 'src/modules/proffesions/entities/proffesion.entity';
import { Sex } from 'src/modules/sexes/entities/sex.entity';
import { CostCenter } from 'src/modules/cost-centers/entities/cost-center.entity';
import { MedicalConsultation } from 'src/modules/medical-consultations/entities/medical-consultation.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { ClientLevel } from 'src/modules/client-levels/entities/client-level.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ default: null })
  user_type_id: number;

  @Column({ default: '' })
  @Index()
  name: string;

  @Column({ default: '' })
  @Index()
  surname: string;

  @Column({ default: '' })
  @Index()
  surname_first: string;

  @Column({ default: '' })
  @Index()
  surname_second: string;

  @Column({ default: null })
  @Index()
  document_type_id: number;

  @Column({ default: '' })
  @Index()
  document_number: string;

  @Column({ default: null, type: 'tinyint' })
  sex_id: number;

  @Column({ nullable: true, type: 'date' })
  birthdate: string;

  @Column({ default: null })
  proffesion_id: number;

  @Column({ default: '' })
  speciality: string;

  @Column({ default: '' })
  colegiatura: string;

  @Column({ default: null, nullable: true })
  ubigeo_peru_department_id: number;

  @Column({ default: null, nullable: true })
  ubigeo_peru_province_id: number;

  @Column({ default: null, nullable: true })
  ubigeo_peru_district_id: number;

  @Column({ default: '' })
  address: string;

  @Column({ default: null })
  cost_center_id: number;

  @Column({ default: null, type: 'tinyint', width: 1 })
  can_download: number;

  @Column({ default: null, type: 'tinyint', width: 1 })
  is_central: number;

  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  @Index()
  phone: string;

  @Column({ default: '' })
  document: string;

  @Column()
  password: string;

  @Column({ default: '' })
  pic: string;

  @Column({ default: null })
  pic_file_id: number;

  @Column()
  role_id: number;

  @Column({ nullable: true, type: 'datetime' })
  date_locked: string;

  @Column({ nullable: false, type: 'int', default: 0 })
  login_attempts: number;

  @Column({ nullable: true, type: 'int', default: null })
  client_level_id: number;

  @Column({ nullable: false, type: 'varchar', default: '' })
  oauth_secret_key: string;

  @Column({ nullable: false, type: 'tinyint', default: 0 })
  secret_key_approved: number;

  @ManyToOne(() => ClientLevel, client => client.user)
  @JoinColumn({ name: 'client_level_id' })
  client_level: ClientLevel;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => UserType, userType => userType.users)
  @JoinColumn({ name: 'user_type_id' })
  user_type: UserType;

  @ManyToOne(() => DocumentType, documentType => documentType.users)
  @JoinColumn({ name: 'document_type_id' })
  document_type: DocumentType;

  @ManyToOne(() => UbigeoPeruDeparment, ubigeoPeruDepartment => ubigeoPeruDepartment.users)
  @JoinColumn({ name: 'ubigeo_peru_department_id' })
  ubigeo_peru_department: UbigeoPeruDeparment;

  @ManyToOne(() => UbigeoPeruProvince, ubigeoPeruProvince => ubigeoPeruProvince.users)
  @JoinColumn({ name: 'ubigeo_peru_province_id' })
  ubigeo_peru_province: UbigeoPeruProvince;

  @ManyToOne(() => UbigeoPeruDistrict, ubigeoPeruDistrict => ubigeoPeruDistrict.users)
  @JoinColumn({ name: 'ubigeo_peru_district_id' })
  ubigeo_peru_district: UbigeoPeruDistrict;

  @OneToOne(() => File, file => file.user)
  @JoinColumn({ name: 'pic_file_id' })
  pic_file: File;

  @OneToMany(() => Session, session => session.user)
  sessions: Session[];

  @OneToMany(() => Log, log => log.user)
  logs: Log[];

  @OneToMany(() => AttendanceRecord, attendanceRecord => attendanceRecord.user)
  attendance_records: AttendanceRecord[];

  @OneToMany(() => MedicalCalendar, medicalCalendar => medicalCalendar.user)
  medical_calendars: MedicalCalendar[];

  @OneToMany(() => Token, token => token.user)
  tokens: Token[];

  @OneToMany(() => UserAssigment, userAssignment => userAssignment.user)
  user_assignments: UserAssigment[];

  @OneToMany(() => UserFile, userFile => userFile.user)
  user_files: UserFile[];

  @ManyToOne(() => Proffesion, proffession => proffession.users)
  @JoinColumn({ name: 'proffesion_id' })
  proffession: Proffesion;

  @ManyToOne(() => Sex, sex => sex.users)
  @JoinColumn({ name: 'sex_id' })
  sex: Sex;

  @ManyToOne(() => CostCenter, costCenter => costCenter.users)
  @JoinColumn({ name: 'cost_center_id' })
  cost_center: CostCenter;

  @OneToMany(() => MedicalConsultation, medicalConsultation => medicalConsultation.user)
  medical_consultations: MedicalConsultation[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];
}
