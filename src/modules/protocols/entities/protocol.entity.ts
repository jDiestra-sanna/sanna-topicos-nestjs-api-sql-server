import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { ProtocolType } from './protocol-type.entity';
import { ProtocolFile } from './protocol-files.entity';
import { Client } from 'src/modules/clients/entities/client.entity';
import { SubProtocol } from 'src/modules/subprotocols/entities/subprotocol.entity';

@Entity({ name: 'protocols' })
export class Protocol extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  @Index()
  title: string;

  @Column({ type: 'int' })
  protocol_type_id: number;

  @Column({ type: 'varchar', length: 1500 })
  @Index({ fulltext: true })
  description: string;

  @Column({ type: 'int', default: null, nullable: true })
  client_id: number;

  @ManyToOne(() => ProtocolType, protocolType => protocolType.protocol)
  @JoinColumn({ name: 'protocol_type_id' })
  protocol_type: ProtocolType;

  @OneToMany(() => ProtocolFile, protocolFile => protocolFile.protocol)
  protocol_files: ProtocolFile[];

  @ManyToOne(() => Client, client => client.protocol)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @OneToMany(() => SubProtocol, subProtocol => subProtocol.protocol)
  sub_protocol: SubProtocol[];
}
