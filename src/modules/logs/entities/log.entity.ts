import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LogType } from './log-type.dto';
import { LogTarget } from './log-target';

@Entity({ name: 'logs' })
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  log_type_id: number;

  @Column()
  user_id: number;

  @Column({ default: null })
  target_row_id: number;

  @Column({ default: '' })
  target_row_label: string;

  @Column({ default: null })
  log_target_id: number;

  @Column({ default: null })
  parent_row_id: number;

  @Column({ default: '' })
  parent_row_label: string;

  @Column({ default: null })
  parent_log_target_id: number;

  @Column({ type: 'text', nullable: true })
  data: string;

  @Column({ type: 'datetime', default: () => 'getDate()' })
  @Index()
  date_created: string;

  @ManyToOne(() => LogType, logType => logType.logs)
  @JoinColumn({ name: 'log_type_id' })
  log_type: LogType;

  @ManyToOne(() => User, user => user.logs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => LogTarget, logTarget => logTarget.log_targets)
  @JoinColumn({ name: 'log_target_id' })
  log_target: any;

  @ManyToOne(() => LogTarget, logTarget => logTarget.log_target_parents)
  @JoinColumn({ name: 'parent_log_target_id' })
  parent_log_target: any;
}
