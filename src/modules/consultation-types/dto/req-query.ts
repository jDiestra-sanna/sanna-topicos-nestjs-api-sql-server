import { IsEnum, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery, OrderDir } from 'src/common/dto/url-query.dto';

export enum OrderCol {
  ID = 'consultation_types.id',
  NAME = 'consultation_types.name',
  STATE = 'consultation_types.state',
  DATE_CREATED = 'consultation_types.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.NAME;

  @IsOptional()
  @IsEnum(OrderDir)
  order_dir: OrderDir = OrderDir.ASC;
}
