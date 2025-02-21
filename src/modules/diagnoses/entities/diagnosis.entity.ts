import { BaseEntity } from "src/common/entities/base.entity";
import { Proffesion } from "src/modules/proffesions/entities/proffesion.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { DiagnosisType } from "./diagnosis-type.entity";
import { MedicalDiagnosis } from "src/modules/medical-consultations/medical-diagnoses/entity/medical-diagnosis.entity";

@Entity({ name: 'diagnoses' })
export class Diagnosis extends BaseEntity {
    @Column()
    @Index()
    code: string
    
    @Column()
    diagnosis_type_id: number
    
    @Column()
    @Index()
    name: string

    @Column()
    proffesion_id: number

    @ManyToOne(() => Proffesion, (profession) => profession.diagnoses)
    @JoinColumn({name: 'proffesion_id'})
    proffesion: Proffesion

    @ManyToOne(() => DiagnosisType, (diagnosisType) => diagnosisType.diagnoses)
    @JoinColumn({name: 'diagnosis_type_id'})
    diagnosis_type: DiagnosisType

    @OneToMany(() => MedicalDiagnosis, medical_diagnoses => medical_diagnoses.main_diagnosis)
    medical_diagnoses: MedicalDiagnosis[]
}