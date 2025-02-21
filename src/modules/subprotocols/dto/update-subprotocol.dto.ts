import { IsInt, IsOptional, IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { ProtocolExists, ProtocolExistsRule } from 'src/modules/protocols/decorators/protocol-exists.decorator';

export class UpdateSubProtocolDto {
  @IsString({ message: 'Título de subprotocolo debe ser texto' })
  @MaxLength(100, { message: 'Título de subprotocolo debe tener como máximo 100 caracteres' })
  @MinLength(1, { message: 'Ingrese un título' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Descripción de subprotocolo debe ser texto' })
  @MinLength(1, { message: 'Ingrese una descripción' })
  @MaxLength(1500, { message: 'Descripcion máximo 1500 caracteres' })
  @IsOptional()
  description?: string;

  @IsInt({ message: 'Ingrese un Protocolo' })
  @ProtocolExists({ message: 'Protocolo no existe' })
  @IsOptional()
  protocol_id?: number;
}
