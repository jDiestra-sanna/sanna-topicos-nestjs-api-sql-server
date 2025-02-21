import { BaseEntity } from 'src/common/entities/base.entity';
import { Protocol } from 'src/modules/protocols/entities/protocol.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SubProtocolFile } from './subprotocol-files.entity';

@Entity({ name: 'subprotocols' })
export class SubProtocol extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  @Index()
  title: string;

  @Column({ type: 'varchar', length: 1500 })
  @Index({ fulltext: true })
  description: string;

  @Column({ type: 'int' })
  protocol_id: number;

  @ManyToOne(() => Protocol, protocol => protocol.sub_protocol)
  @JoinColumn({ name: 'protocol_id' })
  protocol: Protocol;

  @OneToMany(() => SubProtocolFile, subProtocolFile => subProtocolFile.subprotocol)
  subprotocol_files: SubProtocolFile[];
}