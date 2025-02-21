import { IsEnum, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery, OrderDir } from 'src/common/dto/url-query.dto';

export enum OrderCol {
  ID = 'patient_profiles.id',
  NAME = 'patient_profiles.name',
  STATE = 'patient_profiles.state',
  DATE_CREATED = 'patient_profiles.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.NAME;

  @IsOptional()
  @IsEnum(OrderDir)
  order_dir: OrderDir = OrderDir.ASC;
}
