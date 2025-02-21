import { IsDateString, IsMilitaryTime } from 'class-validator';

export class MedicalCalendarDayCreationRequestDto {
  medical_calendar_id: number;

  @IsDateString()
  day: string;

  @IsMilitaryTime()
  entry_time: string;

  @IsMilitaryTime()
  leaving_time: string;

  hours_per_day: number;
}
