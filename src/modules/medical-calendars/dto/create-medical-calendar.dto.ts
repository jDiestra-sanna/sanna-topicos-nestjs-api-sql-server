import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsMilitaryTime,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { CampusIsEnabledRule } from '../validators/campus.validator';
import { UserExists } from 'src/modules/users/decorators/user-exists.decorator';
import { CampusExists } from 'src/modules/campus/decorators/campus-exists.decorator';
import { MedicalCalendarDayCreationRequestDto } from './create-medical-calendar-day.dto';

export class MedicalCalendarCreationRequestDto {
  @IsInt()
  @Type(() => Number)
  @UserExists({ message: 'Usuario no existe' })
  user_id: number;

  @IsInt()
  @Type(() => Number)
  @Validate(CampusIsEnabledRule)
  @CampusExists({ message: 'Campus no existe' })
  campus_id: number;

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @IsInt()
  @Min(1950)
  @Max(2100)
  @Type(() => Number)
  year: number;

  @IsInt()
  @IsIn([0, 1])
  @Type(() => Number)
  see_email: number;

  @IsInt()
  @IsIn([0, 1])
  @Type(() => Number)
  see_phone: number;

  // @IsMilitaryTime()
  // entry_time: string;

  // @IsMilitaryTime()
  // leaving_time: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe haber al menos un dia seleccionado' })
  // @IsDateString({}, { each: true })
  @ArrayUnique()
  days: MedicalCalendarDayCreationRequestDto[];
}

export class NewMedicalCalendarDto extends MedicalCalendarCreationRequestDto {
  // @Min(1)
  // @IsInt()
  // hours_per_day: number;

  @Min(1)
  @IsInt()
  total_hours: number;
}
