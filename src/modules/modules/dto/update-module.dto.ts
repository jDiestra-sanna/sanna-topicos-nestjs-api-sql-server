import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { ModuleExists } from '../decorators/module-exists.decorator';

export class UpdateModuleDto {
  @IsOptional()
  @Length(3, 50, { message: 'Nombre es requerido (3 a 50 caracteres)' })
  @IsString({ message: 'Nombre es texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Icono es texto' })
  icon?: string;

  @IsOptional()
  @IsIn([0, 1], { message: 'Visible para root deberia ser 0 o 1' })
  @Type(() => Number)
  root: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  parent_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sort?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  level?: number;
}
