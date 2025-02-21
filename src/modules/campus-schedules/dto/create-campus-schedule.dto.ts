import { IsEnum, IsInt, IsMilitaryTime, IsString, Validate } from 'class-validator';
import { OpeningClosingTimeValidator } from '../validators/opening-closing-time.validator';

export enum DayIds {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

export class CreateCampusScheduleDto {
  @IsEnum(DayIds, { message: 'Debe ingresar un dia de la semana valido' })
  @IsInt({ message: 'Dia debe ser un numero entero' })
  day_id: number;

  @IsString({ message: 'Hora de apertura debe ser una cadena de caracteres' })
  @IsMilitaryTime({ message: 'Por favor ingrese un formato valido para la hora de apertura' })
  opening_time: string;

  @IsString({ message: 'Hora de cierre debe ser una cadena de caracteres' })
  @IsMilitaryTime({ message: 'Por favor ingrese un formato valido para la hora de cierre' })
  @Validate(OpeningClosingTimeValidator)
  closing_time: string;

  campus_id: number;
}
