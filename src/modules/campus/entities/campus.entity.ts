import { BaseEntity } from 'src/common/entities/base.entity';
import { AttendanceRecord } from 'src/modules/attendance-records/entities/attendance-record.entity';
import { CampusCondition, CampusConditionIds } from 'src/modules/campus-conditions/entities/campus-condition.entity';
import { CampusSchedule } from 'src/modules/campus-schedules/entities/campus-schedule.entity';
import { Client } from 'src/modules/clients/entities/client.entity';
import { MedicalCalendar } from 'src/modules/medical-calendars/entities/medical-calendar.entity';
import { MedicalConsultation } from 'src/modules/medical-consultations/entities/medical-consultation.entity';
import { UbigeoPeruDeparment } from 'src/modules/ubigeo/entities/departments.entity';
import { UbigeoPeruDistrict } from 'src/modules/ubigeo/entities/district.entity';
import { UbigeoPeruProvince } from 'src/modules/ubigeo/entities/province.entity';
import { UserAssigment } from 'src/modules/users/entities/user-assignment.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';

@Entity({ name: 'campus' })
@Unique(['correlative'])
export class Campus extends BaseEntity {
  @Column()
  client_id: number;

  @Column()
  correlative: string;

  @Column()
  @Index()
  name: string;

  @Column({ type: 'date' })
  opening_date: Date;

  @Column({ default: null })
  ubigeo_peru_department_id: number;

  @Column({ default: null })
  ubigeo_peru_province_id: number;

  @Column({ default: null })
  ubigeo_peru_district_id: number;

  @Column()
  address: string;

  @Column({ default: '' })
  contact: string;

  @Column({ default: '' })
  phone: string;

  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  warehouse_code: string;

  @Column({ default: '' })
  pic: string;

  @Column({ type: 'int', default: CampusConditionIds.NOT_OPERATIVE })
  condition_id: number;

  @ManyToOne(() => UbigeoPeruDeparment, ubigeoPeruDepartment => ubigeoPeruDepartment.campuses, {})
  @JoinColumn({ name: 'ubigeo_peru_department_id' })
  ubigeo_peru_department: UbigeoPeruDeparment;

  @ManyToOne(() => UbigeoPeruProvince, ubigeoPeruProvince => ubigeoPeruProvince.campuses, {})
  @JoinColumn({ name: 'ubigeo_peru_province_id' })
  ubigeo_peru_province: UbigeoPeruProvince;

  @ManyToOne(() => UbigeoPeruDistrict, ubigeoPeruDistrict => ubigeoPeruDistrict.campuses, {})
  @JoinColumn({ name: 'ubigeo_peru_district_id' })
  ubigeo_peru_districts: UbigeoPeruDistrict;

  @ManyToOne(() => Client, client => client.campuses)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @OneToMany(() => MedicalCalendar, medicalCalendar => medicalCalendar.campus)
  medical_calendars: MedicalCalendar[];

  @OneToMany(() => UserAssigment, userAssignment => userAssignment.campus)
  user_assignments: UserAssigment[];

  @OneToMany(() => MedicalConsultation, medicalConsultation => medicalConsultation.campus)
  medical_consultations: MedicalConsultation[];

  @OneToMany(() => AttendanceRecord, attendanceRecord => attendanceRecord.campus)
  attendance_records: AttendanceRecord[];

  @ManyToOne(() => CampusCondition, campusCondition => campusCondition.campuses)
  @JoinColumn({ name: 'condition_id' })
  campus_condition: CampusCondition;

  @OneToMany(() => CampusSchedule, campusSchedule => campusSchedule.campus)
  campus_schedule: CampusSchedule[];
}
