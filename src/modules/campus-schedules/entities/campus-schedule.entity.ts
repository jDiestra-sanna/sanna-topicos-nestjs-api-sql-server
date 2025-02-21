import { BaseEntity } from 'src/common/entities/base.entity';
import { Campus } from 'src/modules/campus/entities/campus.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

@Entity({ name: 'campus_schedules' })
@Unique(['day_id', 'campus_id'])
export class CampusSchedule extends BaseEntity {
  @Column({ type: 'tinyint' })
  day_id: number;

  @Column({ type: 'time' })
  opening_time: string;

  @Column({ type: 'time' })
  closing_time: string;

  @Column({ type: 'int' })
  campus_id: number;

  @ManyToOne(() => Campus, campus => campus.campus_schedule)
  @JoinColumn({ name: 'campus_id' })
  campus: Campus;
}
