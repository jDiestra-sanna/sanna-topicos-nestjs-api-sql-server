import { BaseEntity } from 'src/common/entities/base.entity';
import { AttendanceRecord } from 'src/modules/attendance-records/entities/attendance-record.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity({ name: 'sessions' })
export class Session extends BaseEntity {
  @Column({ default: null })
  user_id: number;

  @Column({ default: '' })
  uuid: string;

  @Column({ default: '' })
  token: string;

  @Column({ default: '' })
  platform: string;

  @Column({ default: '' })
  language: string;

  @Column({ default: '' })
  os: string;

  @Column({ default: '' })
  os_version: string;

  @Column({ default: '' })
  device_brand: string;

  @Column({ default: '' })
  device_model: string;

  @Column({ default: '' })
  app_version: string;

  @Column({ default: null, type: 'float' })
  lat: number;

  @Column({ default: null, type: 'float' })
  lng: number;

  @Column({ default: '' })
  user_agent: string;

  @Column({ nullable: true, type: 'datetime' })
  date_expiration: string;

  @ManyToOne(() => User, user => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => AttendanceRecord, attendanceRecord => attendanceRecord.session)
  attendance_record: AttendanceRecord
}
