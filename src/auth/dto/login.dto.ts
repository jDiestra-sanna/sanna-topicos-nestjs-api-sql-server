import { IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  language: string;

  @IsString()
  os: string;

  @IsString()
  os_version: string;

  @IsString()
  platform: string;

  @IsOptional()
  @IsString()
  user_agent: string;

  @IsString()
  uuid: string;

  @IsString()
  password: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  token_recaptcha?: string;

  @IsString()
  app_version: string;

  @IsOptional()
  @IsString()
  totp_code?: string;
}
