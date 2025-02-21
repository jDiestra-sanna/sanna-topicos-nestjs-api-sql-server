import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { ProtocolTypeExists } from '../decorators/protocol-type-exists.decorator';

export enum OrderCol {
  ID = 'protocols.id',
  TITLE = 'protocols.title',
  DESCRIPTION = 'protocols.description',
  PROTOCOL_TYPE_NAME = 'protocol_types.name',
  STATE = 'protocols.state',
  DATE_CREATED = 'protocols.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @ProtocolTypeExists({ message: 'Tipo de protocolo no existe' })
  @Type(() => Number)
  protocol_type_id: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  client_id: number[];
}
