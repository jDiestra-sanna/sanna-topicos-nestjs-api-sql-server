import { IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderDir {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum OrderCol {
  ID = 'id',
  NAME = 'name',
  STATE = 'state',
  DATE_CREATED = 'date_created',
}

export class BaseFindAllRequestQuery {
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

  @IsOptional()
  query: string;

  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol | any = OrderCol.ID;

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
