import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Log } from './log.entity';

export enum LogTargetsIds {
  USER = 1,
  ROLE = 2,
  MODULE = 3,
  SETTING = 4,
  GROUP = 5,
  CLIENT = 6,
  CAMPUS = 7,
  SESSION = 8,
  FILE=9,     
  FILE_TYPE=10,
  USER_TYPE=11,
  COST_CENTER=12,
  DOCUMENT_TYPE=13,
  PROFFESION=14,
  USER_ASSIGNMENT=15,
  USER_FILE=16,
  MEDICAL_CALENDAR=17,
  ATTENDANCE_RECORD=18,
  PROTOCOL=19,
  MEDICINE=20,
  DIAGNOSIS=21,
  PROTOCOL_FILE=22,
  SUBPROTOCOL=23,
  SUBPROTOCOL_FILE=24,
  PATIENT=25,
  MEDICAL_CONSULTATION=26,
  NOTIFICATION=27,
}

@Entity({ name: 'log_targets' })
export class LogTarget extends BaseEntity {
  @Column()
  name: string;

  @Column()
  label: string;

  @OneToMany(() => Log, log => log.log_target)
  log_targets: Log[];

  @OneToMany(() => Log, log => log.parent_log_target)
  log_target_parents: Log[];
}
