import { IsEnum, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';

export enum OrderCol {
  ID = 'session.id',
  PLATFORM = 'session.platform',
  LANGUAGE = 'session.language',
  OS = 'session.os',
  STATE = 'session.state',
  DATE_CREATED = 'session.date_created',
  USER_NAME = 'user.name',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;
}
