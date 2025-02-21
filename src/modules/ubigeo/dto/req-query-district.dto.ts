import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { BaseFindAllRequestQuery, OrderDir } from 'src/common/dto/url-query.dto';
import { UbigeoPeruDepartmentExists } from '../decorators/department-exists.decorator';
import { UbigeoPeruProvinceExists } from '../decorators/province-exists.decorator';

export enum OrderCol {
  ID = 'district.id',
  NAME = 'district.name',
  DEPARTMENT_NAME = 'department.name',
  PROVINCE_NAME = 'province.name',
}

export class ReqQueryDistrict extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.NAME;

  @IsOptional()
  @IsEnum(OrderDir)
  order_dir: OrderDir = OrderDir.ASC;

  @IsOptional()
  @IsInt()
  @Min(1)
  @UbigeoPeruDepartmentExists({message: 'Departamento no existe'})
  @Type(() => Number)
  department_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @UbigeoPeruProvinceExists({message: 'Provincia no existe'})
  @Type(() => Number)
  province_id: number;
}
