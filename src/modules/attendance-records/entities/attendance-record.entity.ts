import { Campus } from 'src/modules/campus/entities/campus.entity';
import { Session } from 'src/modules/sessions/entities/session.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum AttendanceRecordLeavingIds {
  TURN_SHIFT = 1,
  LAST_TURN = 2,
  OTHERS = 3,
}

@Entity({ name: 'attendance_records' })
// @Unique(['user_id', 'day'])
export class AttendanceRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  @Index()
  day: string;

  @Column({ type: 'time' })
  entry_time: string;

  @Column({ type: 'time', nullable: true, default: null })
  leaving_time: string;

  @Column({ default: '' })
  leaving_observation: string;

  @Column()
  user_id: number;

  @ManyToOne(() => User, user => user.attendance_records)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  campus_id: number;

  @ManyToOne(() => Campus, campus => campus.attendance_records)
  @JoinColumn({ name: 'campus_id' })
  campus: Campus;

  @Column({ default: null })
  session_id: number;

  @OneToOne(() => Session, session => session.attendance_record)
  @JoinColumn({ name: 'session_id' })
  session: Session;

  is_active: boolean;
  // @AfterLoad()
  // active() {
  //   if (this.entry_time && !this.leaving_time && this.day == getSystemDate()) this.is_active = true;
  //   else this.is_active = false;
  // }
}
