import { BaseEntity } from 'src/common/entities/base.entity';
import { Client } from 'src/modules/clients/entities/client.entity';
import { Column, Entity, Index, OneToMany, Unique } from 'typeorm';

@Entity({ name: 'groups' })
@Unique(["correlative"])
export class Group extends BaseEntity {
  @Column()
  @Index()
  name: string;

  @Column()
  correlative: string;

  @Column({ default: '' })
  contact: string;

  @Column({ default: '' })
  phone: string;

  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  pic: string;

  @OneToMany(() => Client, client => client.group)
  clients: Client[]
}
