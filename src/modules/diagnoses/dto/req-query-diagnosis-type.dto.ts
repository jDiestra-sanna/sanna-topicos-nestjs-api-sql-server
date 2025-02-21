import { IsEnum, IsOptional } from "class-validator";
import { BaseFindAllRequestQuery } from "src/common/dto/url-query.dto";

export enum OrderCol {
  ID = 'diagnosisType.id',
  NAME = 'diagnosisType.name',
  STATE = 'diagnosisType.state',
  DATE_CREATED = 'diagnosisType.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID
}