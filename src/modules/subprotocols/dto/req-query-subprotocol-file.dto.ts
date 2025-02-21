import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { FileExists } from 'src/files/decorators/file-exists.decorator';
import { SubprotocolExists } from '../decorators/subprotocol-exists.decorator';

export enum OrderCol {
  ID = 'subprotocol_files.id',
  SUBPROTOCOL_TITLE = 'subprotocol.title',
  STATE = 'subprotocol_files.state',
  DATE_CREATED = 'subprotocol_files.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @SubprotocolExists({ message: 'Subprotocolo no existe' })
  @Type(() => Number)
  subprotocol_id: number;

  @IsOptional()
  @IsInt()
  @FileExists({ message: 'Archivo no existe' })
  @Type(() => Number)
  file_id: number;
}
