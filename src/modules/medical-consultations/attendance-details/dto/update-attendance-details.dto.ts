import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { AttendancePlaceExists } from 'src/modules/attendance-places/decorators/attendance-place-exists.decorator';
import { attendancePlace } from 'src/modules/attendance-places/entities/attendance-place.entity';
import { ConsultationTypeExists } from 'src/modules/consultation-types/decorators/consultation-type-exists.decorator';
import { consultationType } from 'src/modules/consultation-types/entities/consultation-type.entity';
import { IllnessQuantityTypeExists } from 'src/modules/illness-quantity-types/decorators/illness-quantity-type-exists.decorator';
import { illnessQuantityType } from 'src/modules/illness-quantity-types/entities/illness-quantity-type.entity';
import { MedicalConsultationExists } from '../../decorators/medical-consultation-exists.decorator';

export class UpdateAttendanceDetailDto {
  @IsOptional()
  @IsInt({ message: 'Por favor ingrese un tipo de consulta' })
  @IsEnum(consultationType)
  @ConsultationTypeExists({ message: 'Tipo de consulta no existe' })
  consultation_type_id?: consultationType;

  @IsOptional()
  @IsInt({ message: 'Por favor ingrese un lugar de atención' })
  @IsEnum(attendancePlace)
  @AttendancePlaceExists({ message: 'Lugar de atencion no existe' })
  attendance_place_id?: attendancePlace;

  @ValidateIf(o => o.consultation_type_id == consultationType.EMERGENCY)
  @IsBoolean({ message: 'Ingrese si se derivó a clínica o no' })
  clinic_derived?: boolean;

  @IsOptional()
  @IsString({ message: 'Por favor ingrese un anamnesis' })
  @MaxLength(1500, { message: 'Máximo 1500 caracteres' })
  anamnesis?: string;

  @IsOptional()
  @IsString({ message: 'Por favor ingrese un examen físico' })
  @MaxLength(1500, { message: 'Máximo 1500 caracteres' })
  physical_exam?: string;

  @IsOptional()
  @IsInt({ message: 'Periodo de enfermedad debe ser un número entero' })
  illness_quantity?: number;

  @IsOptional()
  @IsInt({ message: 'Por favor ingrese un tipo de periodo de enfermedad' })
  @IsEnum(illnessQuantityType)
  @IllnessQuantityTypeExists({ message: 'Periodo de enfermedad no existe' })
  illness_quantity_type_id?: illnessQuantityType;

  @IsOptional()
  @IsNumber({}, { message: 'Frecuencia cardíaca debe ser un número' })
  heart_rate?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Frecuencia respiratoria debe ser un número' })
  respiratory_rate?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Temperatura debe ser un número' })
  temperature?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Presión Arterial debe ser un número' })
  pa?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Saturación de oxígeno' })
  oxygen_saturation?: number;

  @IsOptional()
  @IsInt({ message: 'Por favor ingrese el ID de la consulta' })
  @MedicalConsultationExists({ message: 'Consulta medica no existe' })
  medical_consultation_id?: number;
}
