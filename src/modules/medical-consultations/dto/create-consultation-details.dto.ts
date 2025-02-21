import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateMedicalConsultationDto } from './create-medical-consultation.dto';
import { CreateAttendanceDetailDto } from '../attendance-details/dto/create-attendance-details.dto';
import { CreatePrescriptionDto } from '../prescriptions/dto/create-prescription.dto';
import { CreateMedicalDiagnosisDto } from '../medical-diagnoses/dto/create-medical-diagnosis.dto';

export class CreateConsultationDetailsDto {
  @ValidateNested()
  @Type(() => CreateMedicalConsultationDto)
  medical_consultation: CreateMedicalConsultationDto;

  @ValidateNested()
  @Type(() => CreateAttendanceDetailDto)
  attendance_detail: CreateAttendanceDetailDto;

  @ValidateNested()
  @Type(() => CreateMedicalDiagnosisDto)
  medical_diagnosis: CreateMedicalDiagnosisDto;

  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionDto)
  prescription: CreatePrescriptionDto[];
}
