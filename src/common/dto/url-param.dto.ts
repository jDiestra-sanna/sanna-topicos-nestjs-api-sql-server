import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ParamIdDto {
  @IsInt({ message: 'El parametro id tiene que ser un entero' })
  @Min(1, { message: 'El parametro id tiene que ser mayor a 0' })
  @Type(() => Number)
  id: number;
}
