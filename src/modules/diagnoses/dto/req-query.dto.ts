import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery, OrderDir } from 'src/common/dto/url-query.dto';
import { DiagnosisTypeExists } from '../decorators/diagnosis-type-exists.decorator';
import { ProffessionExists } from 'src/modules/proffesions/decorators/proffesion-exists.decorator';

export enum OrderCol {
  ID = 'diagnoses.id',
  CODE = 'diagnoses.code',
  NAME = 'diagnoses.name',
  STATE = 'diagnoses.state',
  DATE_CREATED = 'diagnoses.date_created',
  DIAGNOSIS_TYPE_NAME = 'diagnosis_type.name',
  PROFFESION_NAME = 'proffesion.name',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.NAME;

  @IsOptional()
  @IsEnum(OrderDir)
  order_dir: OrderDir = OrderDir.ASC;

  @IsOptional()
  @IsInt()
  @DiagnosisTypeExists({ message: 'Tipo de diagnostico no existe' })
  @Type(() => Number)
  diagnosis_type_id: number;

  @IsOptional()
  @IsInt()
  @ProffessionExists({ message: 'Profesion no existe' })
  @Type(() => Number)
  proffesion_id: number;
}
