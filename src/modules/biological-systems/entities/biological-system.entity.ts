import { BaseEntity } from 'src/common/entities/base.entity';
import { MedicalDiagnosis } from 'src/modules/medical-consultations/medical-diagnoses/entity/medical-diagnosis.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum biologicalSystem {
  RESPIRATORY_SYSTEM = 1,
  INTEGUMENTARY_SYSTEM = 2,
  MUSCULAR_SYSTEM = 3,
  REPRODUCTIVE_SYSTEM = 4,
  IMMUNE_SYSTEM = 5,
  ENDOCRINE_SYSTEM = 6,
  NERVOUS_SYSTEM = 7,
  EXCRETORY_SYSTEM = 8,
  OSSEOUS_SYSTEM = 9,
  LYMPHATIC_SYSTEM = 10,
  DIGESTIVE_SYSTEM = 11,
  CIRCULATORY_SYSTEM = 12,
}

@Entity({ name: 'biological_systems' })
export class BiologicalSystem extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => MedicalDiagnosis, medical_diagnoses => medical_diagnoses.biological_system)
  medical_diagnoses: MedicalDiagnosis[];
}
