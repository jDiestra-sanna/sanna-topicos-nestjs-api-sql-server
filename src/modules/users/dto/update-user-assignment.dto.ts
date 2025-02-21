import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ClientLevelExists } from 'src/modules/client-levels/decorators/client-level-exists.decorator';
import { ClientLevelIds } from 'src/modules/client-levels/entities/client-level.entity';

export class UpdateUserAssignmentDto {
  // @IsOptional()
  // @IsInt()
  // @Min(0)
  // @Type(() => Number)
  // group_id?: number;

  // @IsOptional()
  // @IsInt()
  // @Min(1)
  // @Type(() => Number)
  // client_id?: number;

  // @IsOptional()
  // @IsInt()
  // @Min(1)
  // @Type(() => Number)
  // campus_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsEnum(ClientLevelIds, {message: 'Nivel de cliente deber ser Grupo, Cliente ó Campus'})
  @ClientLevelExists({ message: 'Nivel de cliente no existe' })
  client_level_id?: ClientLevelIds;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  organizational_entity_id: number; //Grupo, cliente o sede
}
