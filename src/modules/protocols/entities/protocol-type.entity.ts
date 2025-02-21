import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Protocol } from './protocol.entity';

export enum ProtocolTypes {
  PROTOCOL_SANNA = 1,
  PROTOCOL_CLIENT = 2,
}

@Entity({ name: 'protocol_types' })
export class ProtocolType extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Protocol, protocol => protocol.protocol_type)
  protocol: Protocol;
}
