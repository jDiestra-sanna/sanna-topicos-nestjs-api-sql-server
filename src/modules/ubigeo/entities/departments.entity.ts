import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UbigeoPeruProvince } from './province.entity';
import { Campus } from 'src/modules/campus/entities/campus.entity';
import { UbigeoPeruDistrict } from './district.entity';

@Entity({ name: 'ubigeo_peru_departments' })
export class UbigeoPeruDeparment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 45 })
  @Index()
  name: string;

  @OneToMany(() => User, user => user.ubigeo_peru_department)
  users: User[];

  @OneToMany(() => UbigeoPeruProvince, ubigeoPeruProvince => ubigeoPeruProvince.users)
  provinces: UbigeoPeruProvince[];

  @OneToMany(() => Campus, campus => campus.ubigeo_peru_department)
  campuses: Campus[];

  @OneToMany(() => UbigeoPeruDistrict, ubigeoPeruDistrict => ubigeoPeruDistrict.department)
  districts: UbigeoPeruDistrict[];
}
