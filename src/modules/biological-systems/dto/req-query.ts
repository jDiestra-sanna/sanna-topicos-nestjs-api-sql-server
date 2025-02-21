import { IsEnum, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery, OrderDir } from 'src/common/dto/url-query.dto';

export enum OrderCol {
  ID = 'biological_systems.id',
  NAME = 'biological_systems.name',
  STATE = 'biological_systems.state',
  DATE_CREATED = 'biological_systems.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.NAME;

  @IsOptional()
  @IsEnum(OrderDir)
  order_dir: OrderDir = OrderDir.ASC;
}
