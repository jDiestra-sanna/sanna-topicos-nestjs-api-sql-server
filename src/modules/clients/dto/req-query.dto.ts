import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { GroupExists } from 'src/modules/groups/decorators/group-exists.decorator';

export enum OrderCol {
  ID = 'client.id',
  CORRELATIVE = 'client.correlative',
  NAME = 'client.name',
  CONTACT = 'client.contact',
  EMAIL = 'client.email',
  PHONE = 'client.phone',
  STATE = 'client.state',
  GROUP_NAME = 'group.name',
  DATE_CREATED = 'client.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @GroupExists({ message: 'Grupo no existe' })
  @Type(() => Number)
  group_id: number;
}
