import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';
import { CampusExists } from 'src/modules/campus/decorators/campus-exists.decorator';
import { RoleExists } from 'src/modules/roles/decorators/role-exists.decorator';
import { UserExists } from 'src/modules/users/decorators/user-exists.decorator';

export class ReqQueryForm {
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

  @IsOptional()
  @IsInt()
  @Min(1)
  @UserExists({ message: 'Usuario no existe' })
  @Type(() => Number)
  user_id: number;

  @IsInt()
  @Min(1)
  @CampusExists({ message: 'Sede no existe' })
  @Type(() => Number)
  campus_id: number;
}

export class QueryForm extends ReqQueryForm {
  @IsDateString()
  day: string;

  @IsInt()
  @Min(1)
  @RoleExists({ message: 'Usuario no existe' })
  logged_user_role_id: number;
} 
