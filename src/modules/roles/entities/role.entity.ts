import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Perms } from './perms.entity';
import { Module } from '../../modules/entities/module.entity';
import { UserType } from 'src/modules/users/entities/type-user.entity';
import { User } from 'src/modules/users/entities/user.entity';

export enum RoleIds {
  ROOT = 1,
  Admin = 2,
  SUPPORT = 3,
  CLIENT = 4,
  HEALTH_TEAM = 5,
}

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @Column({ default: null })
  user_type_id: number;

  @Column({ default: null, type: 'tinyint' })
  menu_collapsed: number;

  @Column({ default: '' })
  @Index()
  name: string;

  @Column({ default: null })
  home_module_id: number;

  @ManyToOne(() => Module, module => module.roles)
  @JoinColumn({ name: 'home_module_id' })
  home_module: Module;

  @OneToMany(() => Perms, perms => perms.role)
  perms: Perms[];

  @ManyToOne(() => UserType, userType => userType.roles)
  @JoinColumn({ name: 'user_type_id' })
  user_type: UserType;

  @OneToMany(() => User, user => user.role)
  users: User[];
}
