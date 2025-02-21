import { getSystemDate } from 'src/common/helpers/date';
import { IsDateString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CampusExists } from 'src/modules/campus/decorators/campus-exists.decorator';
import { ClientExists } from 'src/modules/clients/decorators/client-exists.decorator';
import { ConsultationTypeExists } from 'src/modules/consultation-types/decorators/consultation-type-exists.decorator';
import { RoleIds } from 'src/modules/roles/entities/role.entity';

export class ReqQuery {
  @IsOptional()
  @IsDateString()
  date_from: string = getSystemDate();

  @IsOptional()
  @IsDateString()
  date_to: string = getSystemDate();

  @IsOptional()
  @IsInt()
  @CampusExists({ message: 'Campus no existe' })
  @Type(() => Number)
  campus_id: number;

  @IsOptional()
  @IsInt()
  @ClientExists({ message: 'Cliente no existe' })
  @Type(() => Number)
  client_id: number;

  @IsOptional()
  @IsInt()
  @ConsultationTypeExists({ message: 'Tipo de consulta no existe' })
  @Type(() => Number)
  consultation_type_id: number;

  role_id: RoleIds;
  
  user_id: number;

  is_central: number
}
