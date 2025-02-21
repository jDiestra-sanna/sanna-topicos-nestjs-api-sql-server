import { BaseEntity } from 'src/common/entities/base.entity';
import { AttendanceDetail } from 'src/modules/medical-consultations/attendance-details/entities/attendance-detail.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum attendancePlace {
  TOPICAL = 1,
  OTHERS = 2,
}

@Entity({ name: 'attendance_places' })
export class AttendancePlace extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => AttendanceDetail, attendance_detail => attendance_detail.attendance_place)
  attendance_details: AttendanceDetail[];
}
