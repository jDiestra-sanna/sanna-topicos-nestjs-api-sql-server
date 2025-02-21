import {
  Contains,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { AttendancePlaceExists } from 'src/modules/attendance-places/decorators/attendance-place-exists.decorator';
import { attendancePlace } from 'src/modules/attendance-places/entities/attendance-place.entity';
import { ConsultationTypeExists } from 'src/modules/consultation-types/decorators/consultation-type-exists.decorator';
import { consultationType } from 'src/modules/consultation-types/entities/consultation-type.entity';
import { IllnessQuantityTypeExists } from 'src/modules/illness-quantity-types/decorators/illness-quantity-type-exists.decorator';
import { illnessQuantityType } from 'src/modules/illness-quantity-types/entities/illness-quantity-type.entity';

export class CreateAttendanceDetailDto {
  @IsInt({ message: 'Por favor ingrese un tipo de consulta' })
  @IsEnum(consultationType, { message: 'Tipo de consulta debe ser Estándar o Emergencia' })
  @ConsultationTypeExists({ message: 'Tipo de consulta no existe' })
  consultation_type_id: consultationType;

  @IsInt({ message: 'Por favor ingrese un lugar de atención' })
  @IsEnum(attendancePlace, { message: 'Lugar de atención debe ser Tópico u Otro' })
  @AttendancePlaceExists({ message: 'Lugar de atencion no existe' })
  attendance_place_id: attendancePlace;

  @ValidateIf(o => o.consultation_type_id == consultationType.EMERGENCY)
  @IsBoolean({ message: 'Ingrese si se derivó a clínica o no' })
  clinic_derived?: boolean;

  @IsString({ message: 'Por favor ingrese un anamnesis' })
  @MaxLength(1500, { message: 'Máximo 1500 caracteres' })
  @MinLength(1, { message: 'Por favor ingrese la anamnesis' })
  anamnesis: string;

  @IsString({ message: 'Por favor ingrese un examen físico' })
  @MaxLength(1500, { message: 'Máximo 1500 caracteres' })
  @MinLength(1, { message: 'Por favor ingrese los detalles del examen físico' })
  physical_exam: string;

  @IsInt({ message: 'Periodo de enfermedad debe ser un número entero' })
  illness_quantity: number;

  @IsInt({ message: 'Por favor ingrese un tipo de periodo de enfermedad' })
  @IsEnum(illnessQuantityType, { message: 'El tiempo de la enfermedad debe ser minutos, horas, días, semanas ó meses' })
  @IllnessQuantityTypeExists({ message: 'Periodo de enfermedad no existe' })
  illness_quantity_type_id: illnessQuantityType;

  @IsInt({ message: 'Frecuencia cardíaca debe ser un número entero' })
  @Min(0)
  @Max(999)
  heart_rate: number;

  @IsInt({ message: 'Frecuencia respiratoria debe ser un número entero' })
  @Min(0)
  @Max(999)
  respiratory_rate: number;

  @IsNumber({}, { message: 'Temperatura debe ser un número' })
  temperature: number;

  @Matches(/^\d{1,3}\/\d{1,3}$/, { message: 'Presión arterial debe ser del formato XXX/XXX' })
  pa: string;

  @IsNumber({}, { message: 'Saturación de oxígeno' })
  oxygen_saturation: number;

  // @IsInt({ message: 'Por favor ingrese el ID de la consulta' })
  medical_consultation_id: number;
}
