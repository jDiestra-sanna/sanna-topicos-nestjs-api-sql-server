import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { UserExists } from 'src/modules/users/decorators/user-exists.decorator';

export enum OrderCol {
  ID = 'notification.id',
  TITLE = 'notification.title',
  BODY = 'notification.body',
  STATE = 'notification.state',
  DATE_CREATED = 'notification.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @UserExists({ message: 'Usuario incorrecto o no existe' })
  @Type(() => Number)
  user_id: number;
}
