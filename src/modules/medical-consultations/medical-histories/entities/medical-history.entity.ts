import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity({ name: 'medical_histories' })
export class MedicalHistory extends BaseEntity {
  @Column({ default: '', length: 1500 })
  surgical_history: string;

  @Column({ default: false, type: 'tinyint' })
  hypertension: boolean;

  @Column({ default: false, type: 'tinyint' })
  asthma: boolean;

  @Column({ default: false, type: 'tinyint' })
  cancer: boolean;

  @Column({ default: false, type: 'tinyint' })
  diabetes: boolean;

  @Column({ default: false, type: 'tinyint' })
  epilepsy: boolean;

  @Column({ default: false, type: 'tinyint' })
  psychological_condition: boolean;

  @Column({ default: '', length: 1500 })
  observation: string;

  @Column({ default: false, type: 'tinyint' })
  others: boolean;

  @Column({ default: '', length: 1500 })
  others_description: string;

  @Column({ type: 'int' })
  patient_id: number;

  @ManyToOne(() => Patient, patient => patient.medical_history)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
