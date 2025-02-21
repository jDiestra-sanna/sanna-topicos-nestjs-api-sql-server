import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsInt, IsString, Length, Matches, Min, ValidateNested } from 'class-validator';
import { RolePermsDto } from './role-perms.dto';
import { ModuleExists } from 'src/modules/modules/decorators/module-exists.decorator';

export class UpdateRoleDto {
  // user_type_id?: number;

  @IsString({ message: 'Nombre debe ser texto' })
  @Length(3, 50, { message: 'Nombre es requerido (3 a 50 caracteres)' })
  @Matches(/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/, {
    message: 'Nombre es requerido (solo letras y espacios)',
  })
  name?: string;

  @IsIn([0, 1], { message: 'Menu minimizado debe ser 0 o 1' })
  menu_collapsed?: number = 0;

  @IsArray({ message: 'Modulos deberia ser un array' })
  @ArrayMinSize(1, { message: 'Rol deberia tener al menos 1 modulo asignado' })
  @ValidateNested({ each: true })
  @Type(() => RolePermsDto)
  perms: RolePermsDto[];

  @IsInt({ message: 'Modulo de Inicio deberia ser un entero' })
  @Min(1, { message: 'Modulo de Inicio es requerido' })
  @Type(() => Number)
  @ModuleExists({ message: 'Modulo no existe' })
  home_module_id: number;
}
