import { BaseEntity } from 'src/common/entities/base.entity';
import { Patient } from 'src/modules/medical-consultations/patients/entities/patient.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum patientProfile {
  TEACHER = 1,
  STUDENT = 2,
  OTHER = 3,
  ADMINISTRATIVE = 4,
  PROVIDER = 5,
  VISITOR = 6,
}

@Entity({ name: 'patient_profiles' })
export class PatientProfile extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'varchar', length: 1500 })
  description: string;

  @OneToMany(() => Patient, patient => patient.patient_profile)
  patients: Patient[];
}
