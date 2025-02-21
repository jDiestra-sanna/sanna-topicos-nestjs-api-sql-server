import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, Length, Matches, Min, MinLength, ValidateIf } from 'class-validator';
import { GroupExists } from 'src/modules/groups/decorators/group-exists.decorator';

export class UpdateClientDto {
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

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => value || null, { toClassOnly: true })
  @GroupExists({ message: 'Grupo no existe' })
  @ValidateIf(o => (o.group_id ? true : false))
  group_id?: number;
}
