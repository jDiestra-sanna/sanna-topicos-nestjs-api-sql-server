import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { BaseFindAllRequestQuery, OrderDir } from 'src/common/dto/url-query.dto';
import { UbigeoPeruDepartmentExists } from '../decorators/department-exists.decorator';

export enum OrderCol {
  ID = 'province.id',
  NAME = 'province.name',
  DEPARTMENT_NAME = 'department.name',
}

export class ReqQueryProvince extends BaseFindAllRequestQuery {
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
}
