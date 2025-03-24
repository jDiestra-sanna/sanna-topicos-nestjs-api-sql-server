import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsInt()
  session_id?: number;

  @IsOptional()
  @IsString()
  leaving_time?: string;

  @IsOptional()
  @IsString()
  leaving_observation?: string;
}
