import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UbigeoPeruDeparment } from './departments.entity';
import { UbigeoPeruProvince } from './province.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Campus } from 'src/modules/campus/entities/campus.entity';

@Entity({ name: 'ubigeo_peru_districts' })
export class UbigeoPeruDistrict {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  province_id: number;

  @Column()
  department_id: number;

  @Column({ length: 45 })
  @Index()
  name: string;

  @ManyToOne(() => UbigeoPeruDeparment, ubigeoPeruDepartment => ubigeoPeruDepartment.districts)
  @JoinColumn({ name: 'department_id' })
  department: UbigeoPeruDeparment;

  @ManyToOne(() => UbigeoPeruProvince, ubigeoPeruProvince => ubigeoPeruProvince.districts)
  @JoinColumn({ name: 'province_id' })
  province: UbigeoPeruProvince;

  @OneToMany(() => User, user => user.ubigeo_peru_district)
  users: User[];

  @OneToMany(() => Campus, campus => campus.ubigeo_peru_districts)
  campuses: Campus[];
}
