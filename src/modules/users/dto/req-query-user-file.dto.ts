import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { UserExists } from '../decorators/user-exists.decorator';
import { FileTypeExists } from 'src/modules/file-types/decorators/file-type-exists.decorator';

export enum OrderCol {
  ID = 'uf.id',
}

export class ReqQueryUserFile extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;
}

export class QueryFindAll extends ReqQueryUserFile {
  @IsInt()
  @UserExists({ message: 'Usuario no existe' })
  user_id: number;

  @IsOptional()
  @IsInt()
  @FileTypeExists({ message: 'Tipo de archivo no existe' })
  file_type_id?: number;
}
