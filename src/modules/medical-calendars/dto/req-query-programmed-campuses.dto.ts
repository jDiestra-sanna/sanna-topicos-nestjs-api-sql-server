import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { UserExists } from 'src/modules/users/decorators/user-exists.decorator';

export enum OrderCol {
  NAME = 'cps.name',
}

export class ReqQueryCampusList extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.NAME;

  @IsOptional()
  @UserExists({ message: 'Usuario no exise' })
  @Type(() => Number)
  @IsInt()
  user_id?: number;
}
