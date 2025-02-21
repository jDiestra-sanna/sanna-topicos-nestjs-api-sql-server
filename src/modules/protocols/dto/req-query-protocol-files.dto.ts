import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { FileExists } from 'src/files/decorators/file-exists.decorator';
import { ProtocolExists } from '../decorators/protocol-exists.decorator';

export enum OrderCol {
  ID = 'protocol_files.id',
  PROTOCOL_TITLE = 'protocol.title',
  STATE = 'protocol_files.state',
  DATE_CREATED = 'protocol_files.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @FileExists({ message: 'Archivo no existe' })
  @Type(() => Number)
  file_id: number;

  @IsOptional()
  @IsInt()
  @ProtocolExists({ message: 'Protocolo no existe' })
  @Type(() => Number)
  protocol_id: number;
}
