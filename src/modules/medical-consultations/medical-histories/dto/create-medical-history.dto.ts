import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class CreateMedicalHistoryDto {
  @ValidateIf(o => (o.surgical_history ? true : false))
  @IsString({ message: 'Antecedentes quirúrgicos debe ser texto' })
  @MinLength(1, { message: 'Por favor especifique si el paciente cuenta con antecedentes quirúrgicos' })
  surgical_history?: string;

  @IsOptional()
  @IsBoolean()
  hypertension?: boolean;

  @IsOptional()
  @IsBoolean()
  asthma?: boolean;

  @IsOptional()
  @IsBoolean()
  cancer?: boolean;

  @IsOptional()
  @IsBoolean()
  epilepsy?: boolean;

  @IsOptional()
  @IsBoolean()
  diabetes?: boolean;

  @IsOptional()
  @IsBoolean()
  psychological_condition?: boolean;

  @ValidateIf(o => (o.psychological_condition ? true : false))
  @IsString({ message: 'Observación debe ser texto' })
  @MinLength(1, { message: 'Por favor ingrese una observación' })
  observation: string;

  @IsOptional()
  @IsBoolean()
  others?: boolean;

  @ValidateIf(o => (o.others ? true : false))
  @IsString({ message: 'Descripcion debe ser texto' })
  @MinLength(1, { message: 'Por favor ingrese una descripcion' })
  others_description?: string;

  patient_id: number;
}
