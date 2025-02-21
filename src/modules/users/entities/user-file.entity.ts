import { BaseEntity } from 'src/common/entities/base.entity';
import { File } from 'src/files/entities/file.entity';
import { FileType } from 'src/modules/file-types/entities/file-type.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_files' })
export class UserFile extends BaseEntity {
  @Column()
  user_id: number;

  @Column()
  file_type_id: number;

  @Column()
  file_id: number;

  @Column({ default: '' })
  description: string;

  @ManyToOne(() => File, file => file.user_files)
  @JoinColumn({ name: 'file_id' })
  file: File;

  @ManyToOne(() => User, user => user.user_files)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => FileType, fileType => fileType.user_files)
  @JoinColumn({ name: 'file_type_id' })
  file_type: FileType;
}
