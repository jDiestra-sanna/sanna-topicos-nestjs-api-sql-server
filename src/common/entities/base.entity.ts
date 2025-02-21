import { Column, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum BaseEntityState {
  ENABLED = 1,
  DISABLED = 2,
  DELETED = 0,
}

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1, type: 'tinyint' })
  @Index()
  state: BaseEntityState;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  date_created: string;

  @Column({ nullable: true, type: 'datetime' })
  date_updated: string;

  @Column({ nullable: true, type: 'datetime' })
  date_deleted: string;
}
