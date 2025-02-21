import { IsInt, IsOptional, Validate } from 'class-validator';
import { FileExistsRule } from '../validators/protocol-file.validator';
import { FileExists } from 'src/files/decorators/file-exists.decorator';

export class UpdateProtocolFileDto {
  @IsInt({ message: 'Id de archivo debe ser un numero entero' })
  @IsOptional()
  @FileExists({ message: 'Archivo no existe' })
  file_id?: number;

  protocol_id?: number;
}
