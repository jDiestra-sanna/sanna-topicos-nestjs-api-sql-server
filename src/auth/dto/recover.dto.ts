import { IsEmail, IsString } from 'class-validator';

export class RecoverDto {
  @IsString()
  @IsEmail({}, {message: 'Deberia ser un email'})
  username: string;

  @IsString()
  token_recaptcha: string;
}
