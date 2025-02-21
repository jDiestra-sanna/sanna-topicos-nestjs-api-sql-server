import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { UserExists } from '../decorators/user-exists.decorator';

export enum OrderCol {
  ID = 'ua.id',
}

export class ReqQueryUserAssignment extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;
}

export class QueryFindAll extends ReqQueryUserAssignment {
  @IsInt()
  @UserExists({ message: 'Usuario no existe' })
  user_id: number;
}
