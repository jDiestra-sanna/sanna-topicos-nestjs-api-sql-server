import { IsEnum, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';

export enum OrderCol {
  ID = 'group.id',
  CORRELATIVE = 'group.correlative',
  NAME = 'group.name',
  CONTACT = 'group.contact',
  EMAIL = 'group.email',
  PHONE = 'group.phone',
  STATE = 'group.state',
  DATE_CREATED = 'group.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;
}
