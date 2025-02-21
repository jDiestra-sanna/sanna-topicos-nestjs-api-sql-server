import { IsInt, IsOptional } from 'class-validator';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsInt()
  session_id?: number;
}
