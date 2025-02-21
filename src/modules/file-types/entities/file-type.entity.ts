import { BaseEntity } from 'src/common/entities/base.entity';
import { UserFile } from 'src/modules/users/entities/user-file.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'file_types' })
export class FileType extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => UserFile, userFile => userFile.file_type)
  user_files: UserFile[];
}
