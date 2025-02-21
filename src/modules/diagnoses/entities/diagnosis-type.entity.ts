import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Diagnosis } from './diagnosis.entity';

export enum DiagnosisTypeIds {
  NANDA = 1,
  CIE10 = 2,
}

@Entity({ name: 'diagnosis_types' })
export class DiagnosisType extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Diagnosis, diagnosis => diagnosis.diagnosis_type)
  diagnoses: Diagnosis[];
}
