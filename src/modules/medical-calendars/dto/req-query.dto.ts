import { Transform, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { CampusExists } from 'src/modules/campus/decorators/campus-exists.decorator';
import { ClientExists } from 'src/modules/clients/decorators/client-exists.decorator';
import { GroupExists } from 'src/modules/groups/decorators/group-exists.decorator';
import { RoleExists } from 'src/modules/roles/decorators/role-exists.decorator';
import { UserExists } from 'src/modules/users/decorators/user-exists.decorator';
import { MedicalCalendarExists } from '../decorators/medical-calendar-exists.decorator';

export enum OrderCol {
  ID = 'user.id',
  NAME = 'user.name',
  SURNAME_FIRST = 'user.surname_first',
  SURNAME_SECOND = 'user.surname_second',
  PHONE = 'user.phone',
  EMAIL = 'user.email',
  IS_CENTRAL = 'user.is_central',
  STATE = 'user.state',
  PROGRAMMED = 'programmed',
  DATE_CREATED = 'user.date_created',
}

export class ReqQueryForm {
  @IsInt()
  @Min(1)
  @UserExists({ message: 'Usuario no existe' })
  @Type(() => Number)
  user_id: number;

  @IsInt()
  @Min(1)
  @CampusExists({ message: 'Campus no existe' })
  @Type(() => Number)
  campus_id: number;

  @IsInt()
  @Min(1950)
  @Max(2100)
  @Type(() => Number)
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.PROGRAMMED;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @GroupExists({ message: 'Grupo no existe' })
  group_id: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ClientExists({ message: 'Cliente no existe' })
  client_id: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @CampusExists({ message: 'Campus no existe' })
  campus_id: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  programmed: number;
}

export class query extends ReqQuery {
  @IsOptional()
  @IsInt()
  @RoleExists({ message: 'Rol no existe' })
  @Type(() => Number)
  role_id: number;
}

export class ReqQueryExport {
  @IsOptional()
  query: string;

  @IsInt({ message: 'Ingrese una Sede válida' })
  @Type(() => Number)
  @CampusExists({ message: 'Campus no existe' })
  campus_id: number;
}

export class ReqQueryDelete {
  @IsArray({ message: 'Por favor ingrese los dias a eliminar' })
  @ArrayNotEmpty({ message: 'Array no debe estar vacío' })
  @IsInt({ each: true, message: 'Cada día debe ser un número entero' })
  @Type(() => Number)
  day_ids: number[];
}
