import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum ClientLevelIds {
  GROUP = 1,
  CLIENT = 2,
  CAMPUS = 3,
}

@Entity({ name: 'client_levels' })
export class ClientLevel extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => User, user => user.client_level)
  user: User[];
}
