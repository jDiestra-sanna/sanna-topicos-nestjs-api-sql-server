import { getUrlStaticFile } from 'src/common/helpers/file';
import { UserFile } from 'src/modules/users/entities/user-file.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { AfterLoad, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'files' })
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  path: string;

  @Column({ type: 'datetime', default: () => 'getDate()' })
  date_created: string;

  url: string;

  @AfterLoad()
  getUrl() {
    this.url = getUrlStaticFile(this.path);
  }

  @OneToOne(() => User, user => user.pic_file)
  user: User;

  @OneToMany(() => UserFile, userFile => userFile.file)
  user_files: UserFile[];
}
