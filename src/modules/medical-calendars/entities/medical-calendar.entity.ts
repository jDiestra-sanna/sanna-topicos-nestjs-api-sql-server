import { Campus } from 'src/modules/campus/entities/campus.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { MedicalCalendarDay } from './medical-calendar-days.entity';

@Entity({ name: 'medical_calendars' })
@Unique(['user_id', 'campus_id', 'year', 'month'])
export class MedicalCalendar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  campus_id: number;

  @Column({ type: 'tinyint', comment: 'month number from 1 to 12' })
  month: number;

  @Column({ comment: 'year number' })
  year: number;

  @Column()
  see_email: number;

  @Column()
  see_phone: number;

  @Column({ type: 'tinyint' })
  total_hours: number;

  @Column({ type: 'datetime', default: () => 'getDate()' })
  date_created: string;

  @Column({ nullable: true, type: 'datetime' })
  date_updated: string;

  @ManyToOne(() => Campus, campus => campus.medical_calendars)
  @JoinColumn({ name: 'campus_id' })
  campus: Campus;

  @ManyToOne(() => User, user => user.medical_calendars)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => MedicalCalendarDay, medicalCalendarDay => medicalCalendarDay.medical_calendar)
  days: MedicalCalendarDay[];
}
