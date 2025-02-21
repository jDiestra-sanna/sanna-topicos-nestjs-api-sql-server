import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Role } from './role.entity';
import { Module } from '../../modules/entities/module.entity';

@Entity({ name: 'perms' })
export class Perms extends BaseEntity {
  @Column()
  role_id: number;

  @Column()
  module_id: number;

  @Column({ default: null, type: 'tinyint' })
  interface: number;

  @Column({ default: null, type: 'tinyint' })
  see: number;

  @Column({ default: null, type: 'tinyint' })
  create: number;

  @Column({ default: null, type: 'tinyint' })
  edit: number;

  @Column({ default: null, type: 'tinyint' })
  delete: number;

  @ManyToOne(() => Role, role => role.perms)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Module, module => module.perms)
  @JoinColumn({ name: 'module_id' })
  module: Module;
}
