import { BaseEntity } from 'src/common/entities/base.entity';
import { Medicine } from 'src/modules/medicines/entities/medicines.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MedicalConsultation } from '../../entities/medical-consultation.entity';

@Entity({ name: 'prescriptions' })
export class Prescription extends BaseEntity {
  @Column({ type: 'int' })
  medicine_id: number;
  
  @Column({ type: 'varchar', length: 1500 })
  workplan: string;
  
  @Column({ default: '', length: 1500 })
  observation: string;
  
  @Column({ type: 'int' })
  medical_consultation_id: number;

  @ManyToOne(() => Medicine, medicine => medicine)
  @JoinColumn({ name: 'medicine_id' })
  medicine: Medicine;

  @ManyToOne(() => MedicalConsultation, medical_consultation => medical_consultation.prescriptions)
  @JoinColumn({ name: 'medical_consultation_id' })
  medical_consultation: MedicalConsultation;
}
                            