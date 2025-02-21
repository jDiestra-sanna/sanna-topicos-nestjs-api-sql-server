import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ClientLevelExists } from 'src/modules/client-levels/decorators/client-level-exists.decorator';
import { ClientLevelIds } from 'src/modules/client-levels/entities/client-level.entity';

export class UserAssignmentCreationRequestDto {
  // @IsOptional()
  // @IsInt()
  // @Min(1, { message: 'Campus es requerido' })
  // @Type(() => Number)
  // campus_id: number;

  @IsInt()
  @Min(1, { message: 'Nivel de cliente requerido' })
  @Type(() => Number)
  @IsEnum(ClientLevelIds, { message: 'Nivel de cliente deber ser Grupo, Cliente ó Campus' })
  @ClientLevelExists({ message: 'Nivel de cliente no existe' })
  client_level_id?: ClientLevelIds;

  @IsInt()
  @Min(0, { message: 'Id de entidad organizacional requerido' })
  @Type(() => Number)
  organizational_entity_id: number; //Grupo, cliente o sede
}

// export class NewUserAssignmentDto extends UserAssignmentCreationRequestDto {
//   @IsInt()
//   @Min(1)
//   user_id: number;
// }
