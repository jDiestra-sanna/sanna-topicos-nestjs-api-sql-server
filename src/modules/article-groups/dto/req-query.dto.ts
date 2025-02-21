import { IsEnum, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';

export enum OrderCol {
  ID = 'article_group.id',
  NAME = 'article_group.name',
  STATE = 'article_group.state',
  DATE_CREATED = 'article_group.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;
}
