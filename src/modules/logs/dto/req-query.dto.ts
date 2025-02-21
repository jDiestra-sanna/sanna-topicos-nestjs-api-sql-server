import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { UserExists } from 'src/modules/users/decorators/user-exists.decorator';
import { LogTypeExists } from '../decorators/log-type-exists.decorator';
import { LogTargetExists } from '../decorators/log-target-exists.decorator';

export enum OrderCol {
  ID = 'log.id',
  NAME = 'name',
  STATE = 'state',
  DATE_CREATED = 'date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @Min(1)
  @UserExists({ message: 'Usuario no existe' })
  @Type(() => Number)
  user_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @LogTypeExists({ message: 'Tipo de log no existe' })
  @Type(() => Number)
  log_type_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @LogTargetExists({ message: 'Log target no existe' })
  @Type(() => Number)
  log_target_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  target_row_id: number;
}
