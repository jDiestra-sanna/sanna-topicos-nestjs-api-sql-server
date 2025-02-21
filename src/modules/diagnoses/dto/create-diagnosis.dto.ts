import { IsInt, IsString, Length, MinLength, Validate } from 'class-validator';
import { DiagnosisByCodeExistsRule } from '../validators/diagnoses-code.validator';
import { DiagnosisTypeExists } from '../decorators/diagnosis-type-exists.decorator';
import { ProffessionExists } from 'src/modules/proffesions/decorators/proffesion-exists.decorator';
import { AssertProffesionByDiagnosisType } from '../validators/assert-proffesion-by-diagnosis-type.validator';

export class CreateDiagnosisDto {
  @IsString({ message: 'Ingrese un código' })
  @Length(1, 6, { message: 'Codigo debe tener como máximo 6 caracteres' })
  @Validate(DiagnosisByCodeExistsRule)
  code: string;

  @IsString({ message: 'Ingrese un nombre de diagnóstico' })
  @MinLength(1)
  name: string;

  @IsInt({ message: 'Ingrese un tipo de diagnóstico' })
  @DiagnosisTypeExists({ message: 'Tipo de diagnostico no existe' })
  @Validate(AssertProffesionByDiagnosisType)
  diagnosis_type_id: number;

  @IsInt({ message: 'Ingrese una profesión' })
  @ProffessionExists({ message: 'Profesion no existe' })
  proffesion_id: number;
}
