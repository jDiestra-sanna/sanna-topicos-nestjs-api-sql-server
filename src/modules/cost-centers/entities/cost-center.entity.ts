import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'cost_centers' })
export class CostCenter extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => User, user => user.cost_center)
  users: User[];
}
