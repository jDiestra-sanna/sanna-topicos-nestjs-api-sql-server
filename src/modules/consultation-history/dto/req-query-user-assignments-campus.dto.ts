import { BaseFindAllRequestQuery, OrderDir } from 'src/common/dto/url-query.dto';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ClientExists } from 'src/modules/clients/decorators/client-exists.decorator';

export enum OrderCol {
  ID = 'campus.id',
  NAME = 'campus.name',
}

export class ReqQueryFindAllUserAssigmentsCampus extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.NAME;

  @IsOptional()
  @IsEnum(OrderDir)
  order_dir: OrderDir = OrderDir.ASC;

  @IsOptional()
  @IsInt()
  @ClientExists({ message: 'Cliente no existe' })
  @Type(() => Number)
  client_id: number;
}
