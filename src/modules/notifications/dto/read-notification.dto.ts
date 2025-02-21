import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class ReadNotificationsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}
