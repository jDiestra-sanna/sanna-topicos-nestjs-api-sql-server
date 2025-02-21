import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { BiologicalSystemExists } from 'src/modules/biological-systems/decorators/biological-system-exists.decorator';
import { DiagnosisExists } from 'src/modules/diagnoses/decorators/diagnosis-exists.decorator';
import { MedicalConsultationExists } from '../../decorators/medical-consultation-exists.decorator';

export enum OrderCol {
  ID = 'medical_diagnoses.id',
  MENTAL_HEALTH = 'medical_diagnoses.involves_mental_health',
  MEDICAL_REST = 'medical_diagnoses.issued_medical_rest',
  STATE = 'medical_diagnoses.state',
  DATE_CREATED = 'medical_diagnoses.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @DiagnosisExists({ message: 'Diagnostico no existe' })
  @Type(() => Number)
  main_diagnosis_id: number;

  @IsOptional()
  @IsInt()
  @DiagnosisExists({ message: 'Diagnostico no existe' })
  @Type(() => Number)
  secondary_diagnosis_id: number;

  @IsOptional()
  @IsInt()
  @BiologicalSystemExists({ message: 'Sistema biologico no existe' })
  @Type(() => Number)
  biological_system_id: number;

  @IsOptional()
  @IsInt()
  @MedicalConsultationExists({ message: 'Consulta medica no existe' })
  @Type(() => Number)
  medical_consultation_id: number;
}
