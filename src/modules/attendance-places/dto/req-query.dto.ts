import { IsEnum, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery, OrderDir } from 'src/common/dto/url-query.dto';

export enum OrderCol {
  ID = 'attendance_places.id',
  NAME = 'attendance_places.name',
  STATE = 'attendance_places.state',
  DATE_CREATED = 'attendance_places.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.NAME;

  @IsOptional()
  @IsEnum(OrderDir)
  order_dir: OrderDir = OrderDir.ASC;
}
