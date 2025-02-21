import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { CampusExists } from 'src/modules/campus/decorators/campus-exists.decorator';
import { ClientExists } from 'src/modules/clients/decorators/client-exists.decorator';
import { GroupExists } from 'src/modules/groups/decorators/group-exists.decorator';

export enum OrderCol {
  ID = 'medical_calendars.id',
  DATE_CREATED = 'medical_calendars.date_created',
}

export enum attendancePersonalStatusIds {
  ATTENDING = 1,
  MISSING = 2,
  PROGRAMMED = 3,
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status_id: attendancePersonalStatusIds;

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
  @GroupExists({ message: 'Grupo no existe' })
  @Type(() => Number)
  group_id: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  month: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  year: number;
}
