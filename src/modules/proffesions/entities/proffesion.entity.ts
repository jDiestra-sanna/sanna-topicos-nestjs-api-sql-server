import { BaseEntity } from 'src/common/entities/base.entity';
import { Diagnosis } from 'src/modules/diagnoses/entities/diagnosis.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum ProffesionIds {
  GENERAL_PRACTITIONER = 1,
  REGISTERED_NURSE = 2,
}

@Entity({ name: 'proffesions' })
export class Proffesion extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Diagnosis, diagnosis => diagnosis.proffesion)
  diagnoses: Diagnosis[];

  @OneToMany(() => User, user => user.proffession)
  users: User[];
}
