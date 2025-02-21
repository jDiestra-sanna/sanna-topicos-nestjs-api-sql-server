import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UpdatePatientDto } from '../patients/dto/update-patient.dto';
import { UpdateAllergyDto } from '../allergies/dto/update-allergy.dto';
import { UpdateMedicalHistoryDto } from '../medical-histories/dto/update-medical-history.dto';

export class UpdatePatientMedicalConsultationDto {
  @ValidateNested()
  @Type(() => UpdatePatientDto)
  patient: UpdatePatientDto;

  @ValidateNested()
  @Type(() => UpdateAllergyDto)
  allergy: UpdateAllergyDto;

  @ValidateNested()
  @Type(() => UpdateMedicalHistoryDto)
  medical_history: UpdateMedicalHistoryDto;
}
