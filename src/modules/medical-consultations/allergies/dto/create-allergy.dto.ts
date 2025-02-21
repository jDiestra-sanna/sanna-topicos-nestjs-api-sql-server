import { IsString, MinLength,  } from 'class-validator';

export class CreateAllergyDto {
  @IsString({ message: 'Alergia a aliemntos debe ser texto' })
  @MinLength(1, { message: 'Por favor especifique si el paciente cuenta con alguna alergia a alimentos' })
  food_allergy: string;

  @IsString({ message: 'Alergia a medicamentos debe ser texto' })
  @MinLength(1, { message: 'Por favor especifique si el paciente cuenta con alguna alergia a medicamentos' })
  drug_allergy: string;

  // @IsInt({ message: 'Ingrese un Id de paciente' })
  // @Validate(PatientExistsRule)
  patient_id: number;
}
