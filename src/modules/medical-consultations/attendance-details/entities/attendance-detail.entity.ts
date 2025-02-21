import { BaseEntity } from 'src/common/entities/base.entity';
import { AttendancePlace, attendancePlace } from 'src/modules/attendance-places/entities/attendance-place.entity';
import { ConsultationType, consultationType } from 'src/modules/consultation-types/entities/consultation-type.entity';
import {
  IllnessQuantityType,
  illnessQuantityType,
} from 'src/modules/illness-quantity-types/entities/illness-quantity-type.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { MedicalConsultation } from '../../entities/medical-consultation.entity';

@Entity({ name: 'attendance_details' })
export class AttendanceDetail extends BaseEntity {
  @Column({ type: 'int' })
  consultation_type_id: consultationType;

  @ManyToOne(() => ConsultationType, consultation_type => consultation_type.attention_details)
  @JoinColumn({ name: 'consultation_type_id' })
  consultation_type: ConsultationType;

  @Column({ type: 'int' })
  attendance_place_id: attendancePlace;

  @ManyToOne(() => AttendancePlace, attendance_place => attendance_place.attendance_details)
  @JoinColumn({ name: 'attendance_place_id' })
  attendance_place: AttendancePlace;

  @Column({ type: 'tinyint', default: null })
  clinic_derived: boolean;

  @Column({ type: 'varchar', length: 1500 })
  anamnesis: string;

  @Column({ type: 'varchar', length: 1500 })
  physical_exam: string;

  @Column({ type: 'int' })
  illness_quantity: number;

  @Column({ type: 'int' })
  illness_quantity_type_id: illnessQuantityType;

  @ManyToOne(() => IllnessQuantityType, illness_quantity_type => illness_quantity_type.attention_details)
  @JoinColumn({ name: 'illness_quantity_type_id' })
  illness_quantity_type: IllnessQuantityType;

  @Column({ default: 0, type: 'int' })
  heart_rate: number;

  @Column({ default: 0, type: 'int' })
  respiratory_rate: number;

  @Column({ default: 0.0, type: 'decimal', scale: 2, precision: 4 })
  temperature: number;

  @Column({ default: '', type: 'varchar' })
  pa: string;

  @Column({ default: 0.0, type: 'decimal', scale: 2, precision: 4 })
  oxygen_saturation: number;

  @Column({ type: 'int' })
  medical_consultation_id: number;

  @OneToOne(() => MedicalConsultation, medical_consultation => medical_consultation.attendance_detail)
  @JoinColumn({ name: 'medical_consultation_id' })
  medical_consultation: MedicalConsultation;
}
