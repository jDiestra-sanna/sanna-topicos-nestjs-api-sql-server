import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { SubProtocol } from './subprotocol.entity';
import { File } from 'src/files/entities/file.entity';

@Entity({ name: 'subprotocol_files' })
export class SubProtocolFile extends BaseEntity {
  @Column()
  file_id: number;

  @OneToOne(() => File)
  @JoinColumn({ name: 'file_id' })
  file: File;

  @Column({ type: 'int' })
  subprotocol_id: number;

  @ManyToOne(() => SubProtocol, subprotocol => subprotocol.subprotocol_files)
  @JoinColumn({ name: 'subprotocol_id' })
  subprotocol: SubProtocol;
}
