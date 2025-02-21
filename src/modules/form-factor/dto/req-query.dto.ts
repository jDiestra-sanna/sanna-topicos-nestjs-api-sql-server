import { IsEnum, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';

export enum OrderCol {
  ID = 'form_factor.id',
  NAME = 'form_factor.name',
  STATE = 'form_factor.state',
  DATE_CREATED = 'form_factor.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;
}
