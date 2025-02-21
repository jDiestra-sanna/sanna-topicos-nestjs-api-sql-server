import { BaseEntity } from 'src/common/entities/base.entity';
import { Perms } from 'src/modules/roles/entities/perms.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { UserType } from 'src/modules/users/entities/type-user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'modules' })
export class Module extends BaseEntity {
  @Column({ default: null })
  user_type_id: number;

  @Column({ default: 0 })
  parent_id: number;

  @Column({ default: null })
  sort: number;

  @Column()
  name: string;

  @Column({ default: '' })
  url: string;

  @Column({ default: '' })
  icon: string;

  @Column({ type: 'tinyint', default: null })
  root: number;

  @Column({ type: 'tinyint', default: null })
  section: number;

  @Column({ default: null })
  level: number;

  @ManyToOne(() => UserType, userType => userType.modules)
  @JoinColumn({ name: 'user_type_id' })
  user_type: UserType;

  @OneToMany(() => Role, role => role.home_module)
  roles: Role[];

  @OneToMany(() => Perms, perms => perms.module)
  perms: Perms[];
}
