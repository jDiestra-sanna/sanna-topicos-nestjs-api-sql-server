import { IsEmail, IsString } from 'class-validator';

export class LoggedInDto {
  @IsString()
  @IsEmail()
  email: string;
}
