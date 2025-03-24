import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Log } from './log.entity';

export enum LogTypesIds {
  LOGIN = 1,
  LOGOUT = 2,
  CREATED = 3,
  UPDATED = 4,
  DELETED = 5,
  ENABLED = 6,
  DISABLED = 7,
  ACCEPTED = 8,
  APPROVED = 9,
  PRESSED = 9,
  OBSERVED = 10,
  REJECTED = 11,
  CANCELED = 12,
  CRON = 13,
  REGISTERED_ENTRY_TIME = 14,
  REGISTERED_LEAVING_TIME = 15,
  REQUESTED_CHANGE_PASSWORD = 16,
  CHANGED_PASSWORD = 17,
  REPORT_EMERGENCY = 18,
  DISCONNECTED_BY_INACTIVITY = 19,
}

@Entity({ name: 'log_types' })
export class LogType extends BaseEntity {
  @Column({ default: '' })
  icon: string;

  @Column({ default: '' })
  color: string;

  @Column({ default: '' })
  prefix: string;

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  suffix: string;

  @OneToMany(() => Log, log => log.log_type)
  logs: Log[]
}
