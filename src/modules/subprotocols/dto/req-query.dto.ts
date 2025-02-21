import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { ProtocolExists } from 'src/modules/protocols/decorators/protocol-exists.decorator';

export enum OrderCol {
  ID = 'subprotocols.id',
  TITLE = 'subprotocols.title',
  DESCRIPTION = 'subprotocols.description',
  PROTOCOL_TITLE = 'protocols.title',
  STATE = 'subprotocols.state',
  DATE_CREATED = 'subprotocols.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ProtocolExists({ message: 'Protocolo no existe' })
  protocol_id: number;
}
