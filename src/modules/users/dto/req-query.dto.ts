import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RoleExists } from 'src/modules/roles/decorators/role-exists.decorator';

export enum OrderDir {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum OrderCol {
  ID = 'user.id',
  NAME = 'user.name',
  SURNAME = 'user.surname',
  SURNAME_FIRST = 'user.surname_first',
  SURNAME_SECOND = 'user.surname_second',
  EMAIL = 'user.email',
  STATE = 'user.state',
  DATE_CREATED = 'user.date_created',
  ROLE_NAME = 'role.name',
}

export class ReqQuery {
  @IsInt()
  @Min(1)
  @Max(10000, { message: 'Limite no debe ser mayor a 10000' })
  @Type(() => Number)
  limit: number = 10;

  @IsInt()
  @Min(0)
  @Max(10000, { message: 'Pager no puede ser mayor a 10000' })
  @Type(() => Number)
  page: number = 0;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  @RoleExists({ message: 'Rol no existe' })
  role_id: number;

  @IsOptional()
  query: string;

  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsEnum(OrderDir)
  order_dir: OrderDir = OrderDir.DESC;

  @IsOptional()
  @IsDateString()
  date_from: string;

  @IsOptional()
  @IsDateString()
  date_to: string;
}
