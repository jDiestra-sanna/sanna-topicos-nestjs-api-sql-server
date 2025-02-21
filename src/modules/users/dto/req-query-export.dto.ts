import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, ValidateIf } from 'class-validator';
import { RoleExists } from 'src/modules/roles/decorators/role-exists.decorator';

export class ReqQueryExport {
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @RoleExists({ message: 'Rol no existe' })
  @ValidateIf(o => o.role_id)
  role_id?: number;

  @IsOptional()
  @ValidateIf(o => o.query)
  query?: string;

  @IsOptional()
  @IsDateString()
  @ValidateIf(o => o.date_from)
  date_from?: string;

  @IsOptional()
  @IsDateString()
  @ValidateIf(o => o.date_to)
  date_to?: string;
}
