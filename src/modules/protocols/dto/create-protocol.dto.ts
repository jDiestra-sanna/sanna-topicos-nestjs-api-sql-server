import { IsInt, IsOptional, IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { ClientExistsRule } from '../validators/protocol-client.validator';
import { ClientExists } from 'src/modules/clients/decorators/client-exists.decorator';
import { ProtocolTypeExists, ProtocolTypeExistsRule } from '../decorators/protocol-type-exists.decorator';

export class CreateProtocolDto {
  @IsString({ message: 'Título de protocolo debe ser texto' })
  @MaxLength(100, { message: 'Título de protocolo debe tener como máximo 100 caracteres' })
  @MinLength(1, { message: 'Ingrese un título' })
  title: string;

  @IsInt({ message: 'Ingrese un tipo de protocolo' })
  @ProtocolTypeExists({ message: 'Tipo de protocolo no existe' })
  protocol_type_id: number;

  @IsString({ message: 'Descripción de protocolo debe ser texto' })
  @IsOptional()
  @MaxLength(1500, { message: 'Descripcion máximo 1500 caracteres' })
  description?: string;

  @IsInt({ message: 'Ingrese un Id de Cliente' })
  @IsOptional()
  @ClientExists({ message: 'Cliente no existe' })
  client_id?: number = null;
}
