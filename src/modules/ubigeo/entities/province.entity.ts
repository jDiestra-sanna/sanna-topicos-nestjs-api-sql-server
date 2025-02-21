import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UbigeoPeruDeparment } from './departments.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Campus } from 'src/modules/campus/entities/campus.entity';
import { UbigeoPeruDistrict } from './district.entity';

@Entity({ name: 'ubigeo_peru_provinces' })
export class UbigeoPeruProvince {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  department_id: number;

  @Column({ length: 45 })
  @Index()
  name: string;

  @ManyToOne(() => UbigeoPeruDeparment, ubigeoPeruDepartment => ubigeoPeruDepartment.provinces)
  @JoinColumn({ name: 'department_id' })
  department: UbigeoPeruDeparment;

  @OneToMany(() => User, user => user.ubigeo_peru_province)
  users: User[];

  @OneToMany(() => Campus, campus => campus.ubigeo_peru_province)
  campuses: Campus[];

  @OneToMany(() => UbigeoPeruDistrict, ubigeoPeruDistrict => ubigeoPeruDistrict.province)
  districts: UbigeoPeruDistrict[];
}
