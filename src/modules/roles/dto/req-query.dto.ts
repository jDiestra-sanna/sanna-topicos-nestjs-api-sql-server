import { IsEnum, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';

export enum OrderCol {
  ID = 'role.id',
  NAME = 'role.name',
  STATE = 'role.state',
  DATE_CREATED = 'role.date_created',
  MODULE_NAME = 'module.name'
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;
}
