import { IsEnum, IsNumber, IsString } from 'class-validator';
import { LogTypesIds } from '../entities/log-type.dto';
import { LogTargetsIds } from '../entities/log-target';
import { LogTypeExists } from '../decorators/log-type-exists.decorator';
import { LogTargetExists } from '../decorators/log-target-exists.decorator';

export class CreateLogDto {
  @IsEnum(LogTypesIds)
  @LogTypeExists({ message: 'Tipo de log no existe' })
  log_type_id: LogTypesIds;

  @IsNumber()
  user_id: number;

  @IsNumber()
  target_row_id?: number;

  @IsString()
  target_row_label?: string;

  @IsEnum(LogTargetsIds)
  @LogTargetExists({ message: 'Log target no existe' })
  log_target_id?: LogTargetsIds;

  @IsNumber()
  parent_row_id?: number;

  @IsString()
  parent_row_label?: string;

  @IsEnum(LogTargetsIds)
  @LogTargetExists({ message: 'Log target no existe' })
  parent_log_target_id?: LogTargetsIds;

  @IsString()
  data?: string;
}
