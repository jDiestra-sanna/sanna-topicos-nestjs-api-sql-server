import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity({ name: 'allergies' })
export class Allergy extends BaseEntity {
  @Column({ default: '', length: 1500 })
  food_allergy: string;

  @Column({ default: '', length: 1500 })
  drug_allergy: string;

  @Column({ type: 'int' })
  patient_id: number;

  @OneToOne(() => Patient, patient => patient.allergy)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
