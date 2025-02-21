import { IsEmail, IsOptional, IsString, Length, Matches, MinLength, ValidateIf } from 'class-validator';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Nombre minimo 3 caracteres' })
  name?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9}$/, {
    message: 'Celular es requerido (solo 9 caracteres)',
  })
  @ValidateIf(o => (o.phone ? true : false))
  phone?: string;

  @ValidateIf(o => (o.email ? o.email.length > 0 : false))
  @IsEmail({}, { message: 'Correo deberia ser un email valido' })
  email?: string;

  @IsOptional()
  @IsString()
  pic?: string;
}
