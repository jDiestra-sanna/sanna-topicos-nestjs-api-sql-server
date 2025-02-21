import { BaseFindAllRequestQuery, OrderDir } from 'src/common/dto/url-query.dto';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { GroupExists } from 'src/modules/groups/decorators/group-exists.decorator';

export enum OrderCol {
  ID = 'clients.id',
  NAME = 'clients.name',
}

export class ReqQueryFindAllUserAssigmentsClients extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.NAME;

  @IsOptional()
  @IsEnum(OrderDir)
  order_dir: OrderDir = OrderDir.ASC;

  @IsOptional()
  @IsInt()
  @GroupExists({ message: 'Grupo no existe' })
  @Type(() => Number)
  group_id: number;
}
