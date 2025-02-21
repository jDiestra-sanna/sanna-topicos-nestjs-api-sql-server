import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAllergyDto {
  @IsOptional()
  @IsString({ message: 'Alergia a aliemntos debe ser texto' })
  @MinLength(1, { message: 'Por favor especifique si el paciente cuenta con alguna alergia a alimentos' })
  food_allergy?: string;

  @IsOptional()
  @IsString({ message: 'Alergia a medicamentos debe ser texto' })
  @MinLength(1, { message: 'Por favor especifique si el paciente cuenta con alguna alergia a medicamentos' })
  drug_allergy?: string;
}
