import { IsIn } from 'class-validator';
import { BaseEntityState } from 'src/common/entities/base.entity';

export class EnabledDisabledDto {
  @IsIn([BaseEntityState.ENABLED, BaseEntityState.DISABLED])
  state: number;
}
