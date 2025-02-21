import { BaseEntity } from 'src/common/entities/base.entity';
import { AttendanceDetail } from 'src/modules/medical-consultations/attendance-details/entities/attendance-detail.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum consultationType {
  STANDARD = 1,
  EMERGENCY = 2,
}

@Entity({ name: 'consultation_types' })
export class ConsultationType extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => AttendanceDetail, medical_record => medical_record.consultation_type)
  attention_details: AttendanceDetail[];
}
