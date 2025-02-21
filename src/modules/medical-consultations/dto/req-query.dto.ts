import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { PatientExists } from '../patients/validators/patient.validator';

export enum OrderCol {
  ID = 'medical_consultations.id',
  PATIENT_NAME = 'patient.name',
  PATIENT_SURNAME_FIRST = 'patient.surname_first',
  PATIENT_SURNAME_SECOND = 'patient.surname_second',
  MEDICAL_REST = 'medical_diagnosis.issued_medical_rest',
  CONSULTATION_TYPE_ID = 'attendance_detail.consultation_type_id',
  STATE = 'medical_consultations.state',
  DATE_CREATED = 'medical_consultations.date_created',
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
