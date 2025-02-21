import { IsEnum, IsOptional } from "class-validator";
import { BaseFindAllRequestQuery } from "src/common/dto/url-query.dto";

export enum OrderCol {
  ID = 'protocolTypes.id',
  NAME = 'protocolTypes.name',
  STATE = 'protocolTypes.state',
  DATE_CREATED = 'protocolTypes.date_created'
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID
}