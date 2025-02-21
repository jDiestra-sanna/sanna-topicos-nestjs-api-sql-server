import { IsInt, IsOptional, IsString, MaxLength, MinLength, Validate, ValidateIf } from 'class-validator';
import { ClientExistsRule } from '../validators/protocol-client.validator';
import { ProtocolTypeExists, ProtocolTypeExistsRule } from '../decorators/protocol-type-exists.decorator';
import { ClientExists } from 'src/modules/clients/decorators/client-exists.decorator';

export class UpdateProtocolDto {
  @IsString({ message: 'Título de protocolo debe ser texto' })
  @MaxLength(100, { message: 'Título de protocolo debe tener como máximo 100 caracteres' })
  @MinLength(1, { message: 'Ingrese un título' })
  @IsOptional()
  title?: string;

  @IsInt({ message: 'Ingrese un tipo de protocolo' })
  @IsOptional()
  @ProtocolTypeExists({ message: 'Tipo de protocolo no existe' })
  protocol_type_id?: number;

  @IsOptional()
  @IsString({ message: 'Descripción de protocolo debe ser texto' })
  @ValidateIf(o => (o.description ? true : false))
  @MaxLength(1500, { message: 'Descripcion máximo 1500 caracteres' })
  description?: string;

  @IsInt({ message: 'Ingrese un Id de Cliente' })
  @IsOptional()
  @ClientExists({ message: 'Cliente no existe' })
  client_id?: number;
}
