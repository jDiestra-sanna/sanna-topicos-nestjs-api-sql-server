import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { MedicineExists } from 'src/modules/medicines/decorators/medicine-exists.decorator';
import { MedicalConsultationExists } from '../../decorators/medical-consultation-exists.decorator';

export enum OrderCol {
  ID = 'prescriptions.id',
  STATE = 'prescriptions.state',
  DATE_CREATED = 'prescriptions.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @MedicineExists({ message: 'Medicina no existe' })
  @Type(() => Number)
  medicine_id: number;

  @IsOptional()
  @IsInt()
  @MedicalConsultationExists({ message: 'Consulta medica no existe' })
  @Type(() => Number)
  medical_consultation_id: number;
}
