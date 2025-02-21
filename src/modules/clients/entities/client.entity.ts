import { BaseEntity } from 'src/common/entities/base.entity';
import { Campus } from 'src/modules/campus/entities/campus.entity';
import { Group } from 'src/modules/groups/entities/group.entity';
import { Protocol } from 'src/modules/protocols/entities/protocol.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';

@Entity({ name: 'clients' })
@Unique(['correlative'])
export class Client extends BaseEntity {
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

  @Column({ default: null })
  group_id: number;

  @OneToMany(() => Protocol, protocol => protocol.client)
  protocol: Protocol[];

  @ManyToOne(() => Group, group => group.clients)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @OneToMany(() => Campus, campus => campus.client)
  campuses: Campus[];
}
