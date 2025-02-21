import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { CampusExists } from 'src/modules/campus/decorators/campus-exists.decorator';
import { ClientExists } from 'src/modules/clients/decorators/client-exists.decorator';
import { GroupExists } from 'src/modules/groups/decorators/group-exists.decorator';

export enum OrderCol {
  ID = 'user_assignments.id',
  STATE = 'user_assignments.state',
  DATE_CREATED = 'user_assignments.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @CampusExists({ message: 'Campus no existe' })
  @Type(() => Number)
  campus_id: number;

  @IsOptional()
  @IsInt()
  @ClientExists({ message: 'Cliente no existe' })
  @Type(() => Number)
  client_id: number;

  @IsOptional()
  @IsInt()
  @GroupExists({ message: 'Grupo no existe' })
  @Type(() => Number)
  group_id: number;
}
