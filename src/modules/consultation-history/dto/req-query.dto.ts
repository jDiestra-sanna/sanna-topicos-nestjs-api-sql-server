import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { CampusExists } from 'src/modules/campus/decorators/campus-exists.decorator';
import { ClientExists } from 'src/modules/clients/decorators/client-exists.decorator';
import { ConsultationTypeExists } from 'src/modules/consultation-types/decorators/consultation-type-exists.decorator';
import { PatientExists } from 'src/modules/medical-consultations/patients/validators/patient.validator';

export enum OrderCol {
  ID = 'medical_consultations.id',
  PATIENT_NAME = 'patient.name',
  ATTENDANCE_PERSONAL_NAME = 'user.name',
  ATTENDANCE_DATE = 'medical_consultations.attendance_date',
  ATTENDANCE_TIME = 'medical_consultations.attendance_time',
  MEDICAL_REST = 'medical_diagnosis.issued_medical_rest',
  CONSULTATION_TYPE_NAME = 'consultation_type.name',
  STATE = 'medical_consultations.state',
  DATE_CREATED = 'medical_consultations.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value == 'true')
  medical_rest: boolean;

  @IsOptional()
  @IsInt()
  @ConsultationTypeExists({ message: 'Tipo de consulta no existe' })
  @Type(() => Number)
  consultation_type_id: number;

  @IsOptional()
  @IsInt()
  @ClientExists({ message: 'Cliente no existe' })
  @Type(() => Number)
  client_id: number;

  @IsOptional()
  @IsInt()
  @CampusExists({ message: 'Campus no existe' })
  @Type(() => Number)
  campus_id: number;

  @IsOptional()
  @IsInt()
  @PatientExists({ message: 'Paciente no existe' })
  @Type(() => Number)
  patient_id: number;
}
