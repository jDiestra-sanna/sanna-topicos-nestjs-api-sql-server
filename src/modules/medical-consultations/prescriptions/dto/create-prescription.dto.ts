import { IsInt, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { MedicineExists } from 'src/modules/medicines/decorators/medicine-exists.decorator';

export class CreatePrescriptionDto {
  @IsOptional()
  @IsInt({ message: 'Por favor ingrese una medicina' })
  @MedicineExists({ message: 'Medicina no existe' })
  medicine_id?: number;

  @IsString({ message: 'Plan de trabajo debe ser texto' })
  @MinLength(1, { message: 'Por favor ingrese un plan de trabajo' })
  @MaxLength(1500, { message: 'Prescripcion máximo 1500 caracteres' })
  workplan: string;

  @IsString({ message: 'Observación debe ser texto' })
  @MaxLength(1500, { message: 'Observación máximo 1500 caracteres' })
  @ValidateIf(o => (o.observation ? true : false))
  observation: string;

  // @IsInt({ message: 'Por favor ingrese una consulta' })
  medical_consultation_id: number;
}
