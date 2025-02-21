import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { PatientExists } from '../../patients/validators/patient.validator';

export enum OrderCol {
  ID = 'allergies.id',
  FOOD_ALLERGY = 'allergies.food_allergy',
  DRUG_ALLERGY = 'allergies.drug_allergy',
  STATE = 'allergies.state',
  DATE_CREATED = 'allergies.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @PatientExists({ message: 'Paciente no existe' })
  @Type(() => Number)
  patient_id: number;
}
