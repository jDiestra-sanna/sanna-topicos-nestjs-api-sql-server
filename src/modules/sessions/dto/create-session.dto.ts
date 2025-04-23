import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { UserExists } from 'src/modules/users/decorators/user-exists.decorator';

export class CreateSessionDto {
  @IsString()
  language: string;

  @IsString()
  os: string;

  @IsString()
  @IsOptional()
  os_version?: string;

  @IsOptional()
  @IsString()
  user_agent: string;

  @IsString()
  uuid: string;

  @IsString()
  token: string;

  @IsString()
  platform: string;

  @IsString()
  date_expiration: string;

  @IsString()
  app_version: string;

  @IsInt()
  @Min(1)
  @UserExists({ message: 'Usuario no existe' })
  user_id: number;
}
