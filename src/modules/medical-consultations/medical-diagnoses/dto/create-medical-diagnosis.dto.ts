import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, ValidateIf } from 'class-validator';
import { BiologicalSystemExists } from 'src/modules/biological-systems/decorators/biological-system-exists.decorator';
import { biologicalSystem } from 'src/modules/biological-systems/entities/biological-system.entity';
import { DiagnosisExists } from 'src/modules/diagnoses/decorators/diagnosis-exists.decorator';

export class CreateMedicalDiagnosisDto {
  @IsInt({ message: 'Por favor ingrese un diagnóstico principal' })
  @DiagnosisExists({ message: 'Diagnostico no existe' })
  main_diagnosis_id: number;

  @IsOptional()
  @IsInt({ message: 'Por favor ingrese un diagnóstico secundario' })
  @DiagnosisExists({ message: 'Diagnostico no existe' })
  secondary_diagnosis_id?: number;

  @IsInt({ message: 'El sistema biológico debe ser un número entero' })
  @IsEnum(biologicalSystem)
  @BiologicalSystemExists({ message: 'Sistema Biologico no existe' })
  biological_system_id: biologicalSystem;

  @IsBoolean({ message: 'Debe seleccionar si la salud mental está involucrada' })
  involves_mental_health: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Debe seleccionar si se emitió un descanso médico' })
  issued_medical_rest?: boolean;

  @ValidateIf(o => o.issued_medical_rest == true)
  @IsDateString({}, { message: 'Por favor ingrese una fecha de inicio válida' })
  medical_rest_start: Date;

  @ValidateIf(o => o.issued_medical_rest == true)
  @IsDateString({}, { message: 'Por favor ingrese una fecha de fin válida' })
  medical_rest_end: Date;

  // @IsInt({ message: 'Ingrese una consulta' })
  medical_consultation_id: number;
}
