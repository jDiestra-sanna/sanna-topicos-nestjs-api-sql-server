import { IsBoolean, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class UpdateMedicalHistoryDto {
  @IsOptional()
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
  @IsOptional()
  @MinLength(1, { message: 'Por favor ingrese una observación' })
  @IsString({ message: 'Observación debe ser texto' })
  observation: string;

  @IsOptional()
  @IsBoolean()
  others?: boolean;

  @ValidateIf(o => (o.others ? true : false))
  @MinLength(1, { message: 'Por favor ingrese una descripcion' })
  @IsString({ message: 'Descripcion debe ser texto' })
  others_description?: string;
}
