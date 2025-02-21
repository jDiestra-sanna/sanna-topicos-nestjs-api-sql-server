import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { MedicalConsultationExists } from '../../decorators/medical-consultation-exists.decorator';

export enum OrderCol {
  ID = 'attendance_details.id',
  CONSULTATION_TYPE_NAME = 'consultation_type.name',
  ATTENDANCE_PLACE_NAME = 'attendance_place.name',
  ILLNESS_QUANTITY_TYPE_NAME = 'illness_quantity_type.name',
  STATE = 'attendance_details.state',
  DATE_CREATED = 'attendance_details.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @MedicalConsultationExists({ message: 'Consulta medica no existe' })
  @Type(() => Number)
  medical_consultation_id: number;
}
