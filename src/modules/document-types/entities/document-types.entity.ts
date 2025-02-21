import { BaseEntity } from 'src/common/entities/base.entity';
import { Patient } from 'src/modules/medical-consultations/patients/entities/patient.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

export enum documentType {
  DNI = 1,
  FOREIGN_CARD = 2,
}

@Entity({ name: 'document_types' })
export class DocumentType extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Patient, patient => patient.document_type)
  patients: Patient[];
  @OneToMany(() => User, user => user.document_type)
  users: User[];
}
