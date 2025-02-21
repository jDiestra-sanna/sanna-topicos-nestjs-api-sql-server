import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ArticleGroups } from 'src/modules/article-groups/entities/article-groups.entity';
import { FormFactor } from 'src/modules/form-factor/entities/form-factor.entity';
import { Prescription } from 'src/modules/medical-consultations/prescriptions/entities/prescription.entity';

@Entity({ name: 'medicines' })
export class Medicine extends BaseEntity {
  @Column()
  @Index()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ default: null })
  dci: string;

  @Column()
  article_group_id: number;

  @Column()
  form_factor_id: number;

  @ManyToOne(() => ArticleGroups, article_group => article_group.medicines)
  @JoinColumn({ name: 'article_group_id' })
  article_group: ArticleGroups;

  @ManyToOne(() => FormFactor, form_factor => form_factor.medicines)
  @JoinColumn({ name: 'form_factor_id' })
  form_factor: FormFactor;

  @OneToMany(() => Prescription, prescription => prescription.medicine)
  prescriptions: Prescription[];
}
