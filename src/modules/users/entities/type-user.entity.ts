import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Module } from 'src/modules/modules/entities/module.entity';
import { Role } from 'src/modules/roles/entities/role.entity';

export enum UserTypeIds {
  USER = 1,
}

@Entity({ name: 'user_types' })
export class UserType extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => User, user => user.user_type)
  users: User[];

  @OneToMany(() => Module, module => module.user_type)
  modules: Module[];

  @OneToMany(() => Role, role => role.user_type)
  roles: Role[];
}
