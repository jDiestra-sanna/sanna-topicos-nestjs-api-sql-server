import { BaseEntity } from "src/common/entities/base.entity";
import { AttendanceDetail } from "src/modules/medical-consultations/attendance-details/entities/attendance-detail.entity";
import { Column, Entity, OneToMany } from "typeorm";

export enum illnessQuantityType {
  MINUTES = 1,
  HOURS = 2,
  DAYS = 3,
  WEEKS = 4,
  MONTHS = 5,
}

@Entity({ name: 'illness_quantity_types' })
export class IllnessQuantityType extends BaseEntity {
  @Column({ unique: true })
  name: string

  @OneToMany(() => AttendanceDetail, attendance_detail => attendance_detail.illness_quantity)
  attention_details: AttendanceDetail[]
}