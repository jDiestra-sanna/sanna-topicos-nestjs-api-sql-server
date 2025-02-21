import { IsInt, IsOptional, IsString, Length, MinLength, Validate, ValidateIf } from 'class-validator';
import { DiagnosisTypeExists } from '../decorators/diagnosis-type-exists.decorator';
import { ProffessionExists } from 'src/modules/proffesions/decorators/proffesion-exists.decorator';
import { AssertProffesionByDiagnosisType } from '../validators/assert-proffesion-by-diagnosis-type.validator';

export class UpdateDiagnosisDto {
  @IsOptional()
  @IsString({ message: 'Ingrese un código' })
  @Length(1, 6, { message: 'Código puede tener como máximo 6 caracteres' })
  code?: string;

  @IsOptional()
  @IsString({ message: 'Ingrese un nombre de diagnóstico' })
  @MinLength(3, { message: 'Nombre minimo 3 caracteres' })
  name?: string;

  // @IsOptional()
  @IsInt({ message: 'Ingrese un tipo de diagnóstico' })
  @DiagnosisTypeExists({ message: 'Tipo de diagnostico no existe' })
  @Validate(AssertProffesionByDiagnosisType)
  @ValidateIf(o => (o.proffesion_id ? true : false))
  diagnosis_type_id?: number;

  // @IsOptional()
  @IsInt({ message: 'Ingrese una profesión' })
  @ProffessionExists({ message: 'Profesion no existe' })
  @ValidateIf(o => (o.diagnosis_type_id ? true : false))
  proffesion_id?: number;
}
