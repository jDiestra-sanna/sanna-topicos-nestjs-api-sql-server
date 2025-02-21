import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Medicine } from 'src/modules/medicines/entities/medicines.entity';
@Entity()
export class ArticleGroups extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Medicine, medicine => medicine.article_group)
  medicines: Medicine[];
}
