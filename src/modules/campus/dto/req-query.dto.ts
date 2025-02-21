import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { ClientExists } from 'src/modules/clients/decorators/client-exists.decorator';
import { GroupExists } from 'src/modules/groups/decorators/group-exists.decorator';
import { UbigeoPeruDepartmentExists } from 'src/modules/ubigeo/decorators/department-exists.decorator';
import { UbigeoPeruDistrictExists } from 'src/modules/ubigeo/decorators/district-exists.decorator';
import { UbigeoPeruProvinceExists } from 'src/modules/ubigeo/decorators/province-exists.decorator';

export enum OrderCol {
  ID = 'campus.id',
  CORRELATIVE = 'campus.correlative',
  NAME = 'campus.name',
  CONTACT = 'campus.contact',
  EMAIL = 'campus.email',
  PHONE = 'campus.phone',
  STATE = 'campus.state',
  DEPARTMENT_NAME = 'department.name',
  PROVINCE_NAME = 'province.name',
  DISTRICT_NAME = 'district.name',
  CLIENT_NAME = 'client.name',
  GROUP_NAME = 'group.name',
  DATE_CREATED = 'campus.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @UbigeoPeruDepartmentExists({ message: 'Departamento no existe' })
  @Type(() => Number)
  ubigeo_peru_department_id: number;

  @IsOptional()
  @IsInt()
  @UbigeoPeruProvinceExists({ message: 'Provincia no existe' })
  @Type(() => Number)
  ubigeo_peru_province_id: number;

  @IsOptional()
  @IsInt()
  @UbigeoPeruDistrictExists({ message: 'Distrito no existe' })
  @Type(() => Number)
  ubigeo_peru_district_id: number;

  @IsOptional()
  @IsInt()
  @ClientExists({ message: 'Cliente no existe' })
  @Type(() => Number)
  client_id: number;

  @IsOptional()
  @IsInt()
  @GroupExists({ message: 'Grupo no existe' })
  @Type(() => Number)
  group_id: number;
}
