import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { AttendanceDetail } from '../attendance-details/entities/attendance-detail.entity';
import { MedicalDiagnosis } from '../medical-diagnoses/entity/medical-diagnosis.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';
import { Campus } from 'src/modules/campus/entities/campus.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity({ name: 'medical_consultations' })
export class MedicalConsultation extends BaseEntity {
  @Column({ type: 'date' })
  attendance_date: Date;

  @Column({ type: 'time', precision: 0 })
  attendance_time: string;

  @Column({ type: 'int' })
  patient_id: number;

  @Column({ type: 'int' })
  campus_id: number;

  @Column({ type: 'int' })
  user_id: number;

  @ManyToOne(() => Patient, patient => patient.medical_consultations)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToOne(() => AttendanceDetail, attendance_detail => attendance_detail.medical_consultation)
  attendance_detail: AttendanceDetail;

  @OneToOne(() => MedicalDiagnosis, medical_diagnosis => medical_diagnosis.medical_consultation)
  medical_diagnosis: MedicalDiagnosis;

  @OneToMany(() => Prescription, prescription => prescription.medical_consultation)
  prescriptions: Prescription[];

  @ManyToOne(() => Campus, campus => campus.medical_consultations)
  @JoinColumn({ name: 'campus_id' })
  campus: Campus;

  @ManyToOne(() => User, user => user.medical_consultations)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
