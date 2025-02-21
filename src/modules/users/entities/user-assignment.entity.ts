import { BaseEntity } from 'src/common/entities/base.entity';
import { Campus } from 'src/modules/campus/entities/campus.entity';
import { Client } from 'src/modules/clients/entities/client.entity';
import { Group } from 'src/modules/groups/entities/group.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_assignments' })
export class UserAssigment extends BaseEntity {
  @Column()
  user_id: number;

  // @Column({ default: null })
  // group_id: number;

  // @Column()
  // client_id: number;

  @Column()
  campus_id: number;

  // group: Group;
  // client: Client;
  @ManyToOne(() => Campus, campus => campus.user_assignments)
  @JoinColumn({ name: 'campus_id' })
  campus: Campus;

  @ManyToOne(() => User, user => user.user_assignments)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
