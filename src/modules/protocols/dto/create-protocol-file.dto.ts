import { IsInt, Validate } from 'class-validator';
import { FileExistsRule } from '../validators/protocol-file.validator';

export class CreateProtocolFileDto {
  @IsInt({ message: 'Id de archivo debe ser un numero entero' })
  @Validate(FileExistsRule)
  file_id: number;

  protocol_id: number;
}
