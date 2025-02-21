import { Type } from 'class-transformer';
import { IsIn, IsInt, Min } from 'class-validator';
import { ModuleExists } from 'src/modules/modules/decorators/module-exists.decorator';

export class RolePermsDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ModuleExists({ message: 'Modulo no existe' })
  module_id: number;

  @IsIn([0, 1])
  @Type(() => Number)
  interface: number = 0;

  @IsIn([0, 1])
  @Type(() => Number)
  see: number = 0;

  @IsIn([0, 1])
  @Type(() => Number)
  create: number = 0;

  @IsIn([0, 1])
  @Type(() => Number)
  edit: number = 0;

  @IsIn([0, 1])
  @Type(() => Number)
  delete: number = 0;
}
