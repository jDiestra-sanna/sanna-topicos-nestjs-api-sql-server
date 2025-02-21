import {
  IsDateString,
  IsEnum,
  IsInt,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { AttendanceRecordLeavingIds } from '../entities/attendance-record.entity';

export class RegisterLeavingTimeDto {
  @IsDateString()
  day: string;

  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
    message: 'El formato de la hora debe ser HH:mm:ss',
  })
  leaving_time: string;

  @IsEnum(AttendanceRecordLeavingIds, {
    message: 'Registro de salida debe ser Cambio de turno, Último turno del día u Otros',
  })
  @IsInt({ message: 'Registro de salida debe ser un número' })
  leaving_id: number;

  @ValidateIf(o => o.leaving_id === AttendanceRecordLeavingIds.OTHERS)
  @IsString({ message: 'Por favor ingrese una observación de salida de sesión' })
  @MinLength(1, { message: 'Por favor ingrese una observación' })
  @MaxLength(80, { message: 'Observación máximo 80 caracteres' })
  leaving_observation?: string;
}
