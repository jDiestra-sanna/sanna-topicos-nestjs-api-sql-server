import { BaseEntity } from 'src/common/entities/base.entity';
import { Campus } from 'src/modules/campus/entities/campus.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum CampusConditionIds {
  PROGRAMMED = 1,
  OPERATIVE = 2,
  NOT_OPERATIVE = 3,
  TURN_SHIFT = 4,
  OTHERS = 5,
}

@Entity({ name: 'campus_conditions' })
export class CampusCondition extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Campus, campus => campus.campus_condition)
  campuses: Campus[];
}
