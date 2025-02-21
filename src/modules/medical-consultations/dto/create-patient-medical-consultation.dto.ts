import { Type } from 'class-transformer';
import { CreatePatientDto } from '../patients/dto/create-patient.dto';
import { ValidateNested } from 'class-validator';
import { CreateAllergyDto } from '../allergies/dto/create-allergy.dto';
import { CreateMedicalHistoryDto } from '../medical-histories/dto/create-medical-history.dto';

export class CreatePatientMedicalConsultationDto {
  @ValidateNested()
  @Type(() => CreatePatientDto)
  patient: CreatePatientDto;

  @ValidateNested()
  @Type(() => CreateAllergyDto)
  allergy: CreateAllergyDto;

  @ValidateNested()
  @Type(() => CreateMedicalHistoryDto)
  medical_history: CreateMedicalHistoryDto;
}
