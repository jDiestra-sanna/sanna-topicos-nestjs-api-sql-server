import { BaseEntity } from 'src/common/entities/base.entity';
import { Medicine } from 'src/modules/medicines/entities/medicines.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'form_factors' })
export class FormFactor extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Medicine, medicine => medicine.form_factor)
  medicines: Medicine[];
}
