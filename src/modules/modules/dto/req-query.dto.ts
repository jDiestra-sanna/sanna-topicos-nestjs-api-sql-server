import { Type } from 'class-transformer';
import { IsEnum, IsIn, Min } from 'class-validator';
import { UserTypeIds } from 'src/modules/users/entities/type-user.entity';

export class ReqQuery {
  @IsIn([0, 1])
  @Type(() => Number)
  nested?: number = 0;

  @Min(0)
  @Type(() => Number)
  @IsEnum(UserTypeIds, { message: 'Tipo de usuario no existe' })
  user_type_id: number = 1;
}
