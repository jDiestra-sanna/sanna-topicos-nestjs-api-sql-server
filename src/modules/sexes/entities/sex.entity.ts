import { BaseEntity } from 'src/common/entities/base.entity';
import { Patient } from 'src/modules/medical-consultations/patients/entities/patient.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

export enum sex {
  MALE = 1,
  FEMALE = 2,
}

@Entity({ name: 'sexes' })
export class Sex extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Patient, patient => patient.sex)
  patient: Patient[];

  @OneToMany(() => User, user => user.sex)
  users: User[];
}
