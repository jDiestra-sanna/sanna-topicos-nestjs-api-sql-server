import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateSettingMapOneDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  cms_version?: string;

  @IsOptional()
  @IsString()
  coin?: string;

  @IsOptional()
  @IsString()
  color_accent?: string;

  @IsOptional()
  @IsString()
  color_primary?: string;

  @IsOptional()
  @IsString()
  country_code?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  entry_time?: string;

  // @IsOptional()
  // @IsString()
  // interval?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Matches(/^[0-9]{9}$/, {
    message: 'Celular 9 digitos',
  })
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'Documento solo digitos' })
  ruc?: string;

  @IsOptional()
  @IsString()
  session_limit?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  website?: string;
}
