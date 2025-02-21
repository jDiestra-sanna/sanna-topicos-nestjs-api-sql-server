import { BaseEntity } from 'src/common/entities/base.entity';
import { DocumentType, documentType } from 'src/modules/document-types/entities/document-types.entity';
import { PatientProfile, patientProfile } from 'src/modules/patient-profile/entity/patient-profile.entity';
import { Sex, sex } from 'src/modules/sexes/entities/sex.entity';
import { AfterLoad, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Allergy } from '../../allergies/entities/allergies.entity';
import { MedicalHistory } from '../../medical-histories/entities/medical-history.entity';
import { MedicalConsultation } from '../../entities/medical-consultation.entity';
import { getAge, isMinor } from 'src/common/helpers/age-calculator';

@Entity({ name: 'patients' })
@Index(['document_type_id', 'document_number'])
export class Patient extends BaseEntity {
  @Column({ type: 'int' })
  document_type_id: documentType;

  @ManyToOne(() => DocumentType, document_type => document_type.patients)
  @JoinColumn({ name: 'document_type_id' })
  document_type: DocumentType;

  @Column()
  document_number: string;

  @Column({ default: '' })
  contact_number: string;

  @Column()
  surname_first: string;

  @Column()
  surname_second: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  birthdate: Date;

  @Column({ type: 'int' })
  sex_id: sex;

  @ManyToOne(() => Sex, sex => sex.patient)
  @JoinColumn({ name: 'sex_id' })
  sex: Sex;

  @Column({ type: 'int' })
  patient_profile_id: patientProfile;

  @ManyToOne(() => PatientProfile, patient_profile => patient_profile.patients)
  @JoinColumn({ name: 'patient_profile_id' })
  patient_profile: PatientProfile;

  @Column({ default: '' })
  other_profile: string;

  @Column({ default: '' })
  minor_attorney_names: string;

  @Column({ default: '' })
  minor_attorney_surnames: string;

  @Column({ default: '' })
  minor_attorney_contact_number: string;

  @OneToOne(() => Allergy, allergies => allergies.patient)
  allergy: Allergy;

  @OneToOne(() => MedicalHistory, medical_histories => medical_histories.patient)
  medical_history: MedicalHistory;

  @OneToMany(() => MedicalConsultation, medical_record => medical_record.patient)
  medical_consultations: MedicalConsultation[];
  
  is_minor: boolean
  age: number

  @AfterLoad()
  patientMetadata() {
    const birthDate = this.birthdate.toString()
    this.is_minor = isMinor(birthDate)
    this.age = getAge(birthDate)
  }
}
