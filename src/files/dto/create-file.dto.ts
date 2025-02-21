import { IsString } from 'class-validator';

export class CreateFileDto {
  @IsString()
  path: string;

  @IsString()
  name: string;
}
