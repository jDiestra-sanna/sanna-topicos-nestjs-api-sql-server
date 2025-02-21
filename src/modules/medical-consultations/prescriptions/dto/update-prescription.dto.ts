import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { MedicineExists } from 'src/modules/medicines/decorators/medicine-exists.decorator';
import { MedicalConsultationExists } from '../../decorators/medical-consultation-exists.decorator';

export class UpdatePrescriptionDto {
  @IsOptional()
  @IsInt({ message: 'Por favor ingrese una medicina' })
  @MedicineExists({ message: 'Medicina no existe' })
  medicine_id?: number;

  @IsString({ message: 'Plan de trabajo debe ser texto' })
  @IsNotEmpty({ message: 'Por favor ingrese un plan de trabajo' })
  @MaxLength(1500, { message: 'Prescripcion máximo 1500 caracteres' })
  @ValidateIf(o => (o.medicine_id ? true : false))
  workplan: string;

  @IsOptional()
  @IsString({ message: 'Observación debe ser texto' })
  @ValidateIf(o => (o.observation ? true : false))
  observation: string;

  @IsOptional()
  @IsInt({ message: 'Por favor ingrese una consulta' })
  @MedicalConsultationExists({ message: 'Consulta medica no existe' })
  medical_consultation_id: number;
}
