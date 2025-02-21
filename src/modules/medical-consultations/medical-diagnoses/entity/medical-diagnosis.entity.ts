import { BaseEntity } from 'src/common/entities/base.entity';
import { BiologicalSystem } from 'src/modules/biological-systems/entities/biological-system.entity';
import { Diagnosis } from 'src/modules/diagnoses/entities/diagnosis.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { MedicalConsultation } from '../../entities/medical-consultation.entity';

@Entity({ name: 'medical_diagnoses' })
export class MedicalDiagnosis extends BaseEntity {
  @Column({ type: 'int' })
  main_diagnosis_id: number;

  @ManyToOne(() => Diagnosis, diagnosis => diagnosis.medical_diagnoses)
  @JoinColumn({ name: 'main_diagnosis_id' })
  main_diagnosis: Diagnosis;

  @Column({ type: 'int', default: null })
  secondary_diagnosis_id: number;

  @ManyToOne(() => Diagnosis, diagnosis => diagnosis.medical_diagnoses)
  @JoinColumn({ name: 'secondary_diagnosis_id' })
  secondary_diagnosis: Diagnosis;

  @Column({ type: 'int', default: null })
  biological_system_id: number;

  @ManyToOne(() => BiologicalSystem, biological_system => biological_system.medical_diagnoses)
  @JoinColumn({ name: 'biological_system_id' })
  biological_system: BiologicalSystem;

  @Column({ type: 'tinyint' })
  involves_mental_health: boolean;

  @Column({ type: 'tinyint', default: false })
  issued_medical_rest: boolean;

  @Column({ type: 'date', default: null })
  medical_rest_start: Date;

  @Column({ type: 'date', default: null })
  medical_rest_end: Date;

  @Column({ type: 'int' })
  medical_consultation_id: number;

  @OneToOne(() => MedicalConsultation, medical_consultation => medical_consultation.medical_diagnosis)
  @JoinColumn({ name: 'medical_consultation_id' })
  medical_consultation: MedicalConsultation;
}
