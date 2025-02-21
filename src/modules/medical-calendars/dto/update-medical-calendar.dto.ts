import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsMilitaryTime,
  IsOptional,
  Min,
} from 'class-validator';
import { MedicalCalendarDayCreationRequestDto } from './create-medical-calendar-day.dto';

export class MedicalCalendarUpdateRequestDto {
  // @IsMilitaryTime()
  // entry_time: string;

  // @IsMilitaryTime()
  // leaving_time: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe haber al menos un dia seleccionado' })
  // @IsDateString({}, { each: true })
  @ArrayUnique()
  days: MedicalCalendarDayCreationRequestDto[];

  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  @Type(() => Number)
  see_email?: number;

  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  @Type(() => Number)
  see_phone?: number;
}

export class MedicalCalendarUpdateDto extends MedicalCalendarUpdateRequestDto {
  // @Min(1)
  // @IsInt()
  // hours_per_day: number;

  @Min(1)
  @IsInt()
  total_hours: number;
}
