import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Protocol } from './protocol.entity';
import { File } from 'src/files/entities/file.entity';

@Entity({ name: 'protocol_files' })
export class ProtocolFile extends BaseEntity {
  @Column()
  file_id: number;

  @OneToOne(() => File)
  @JoinColumn({ name: 'file_id' })
  file: File;

  @Column({ type: 'int' })
  protocol_id: number;

  @ManyToOne(() => Protocol, protocol => protocol.protocol_files)
  @JoinColumn({ name: 'protocol_id' })
  protocol: Protocol;
}
