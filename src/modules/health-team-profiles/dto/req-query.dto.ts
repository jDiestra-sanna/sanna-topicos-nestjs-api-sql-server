import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';
import { CampusExists } from 'src/modules/campus/decorators/campus-exists.decorator';
import { RoleExists } from 'src/modules/roles/decorators/role-exists.decorator';
import { UserExists } from 'src/modules/users/decorators/user-exists.decorator';

export class ReqQueryForm {
  @IsInt({message: 'Año incorrecto'})
  @Min(1950, {message: 'Año no debe ser menor a 1950'})
  @Max(2100, {message: 'Año no debe ser mayor a 2100'})
  @Type(() => Number)
  year: number;

  @IsInt({message: 'Mes incorrecto'})
  @Min(1, { message: 'Mes incorrecto'})
  @Max(12, { message: 'Mes incorrecto'})
  @Type(() => Number)
  month: number;

  // @IsInt()
  // @Min(1)
  // @UserExists({ message: 'Usuario no existe' })
  // @Type(() => Number)
  @IsOptional()
  user_id?: string; // Encoded id

  @IsInt({message: 'Sede incorrecta'})
  @Min(1, { message: 'Sede incorrecta' })
  @CampusExists({ message: 'Sede no existe' })
  @Type(() => Number)
  campus_id: number;
}

export class QueryForm {
  @IsInt({message: 'Año incorrecto'})
  @Min(1950, {message: 'Año no debe ser menor a 1950'})
  @Max(2100, {message: 'Año no debe ser mayor a 2100'})
  @Type(() => Number)
  year: number;

  @IsInt({message: 'Mes incorrecto'})
  @Min(1, { message: 'Mes incorrecto'})
  @Max(12, { message: 'Mes incorrecto'})
  @Type(() => Number)
  month: number;

  @IsInt()
  @UserExists({ message: 'Usuario no existe' })
  @Type(() => Number)
  user_id: number;

  @IsInt({message: 'Sede incorrecta'})
  @Min(1, { message: 'Sede incorrecta' })
  @CampusExists({ message: 'Sede no existe' })
  @Type(() => Number)
  campus_id: number;

  @IsDateString()
  day: string;

  @IsInt()
  @Min(1)
  @RoleExists({ message: 'Usuario no existe' })
  logged_user_role_id: number;
} 
