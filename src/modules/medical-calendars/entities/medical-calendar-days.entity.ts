import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { MedicalCalendar } from './medical-calendar.entity';

@Entity({ name: 'medical_calendar_days' })
// @Unique(['medical_calendar_id', 'day', 'entry_time', 'leaving_time'])
export class MedicalCalendarDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  medical_calendar_id: number;

  @Column({ type: 'date' })
  day: string;

  @Column({ type: 'time', precision: 0 })
  entry_time: string;

  @Column({ type: 'time', precision: 0 })
  leaving_time: string;

  @Column({ type: 'tinyint' })
  hours_per_day: number;

  @Column({ type: 'datetime', default: () => 'getDate()' })
  date_created: string;

  @ManyToOne(() => MedicalCalendar, medicalCalendar => medicalCalendar.days)
  @JoinColumn({ name: 'medical_calendar_id' })
  medical_calendar: MedicalCalendar;

  status: string;
}
