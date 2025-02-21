import { IsInt } from "class-validator";
import { FileExists } from "src/files/decorators/file-exists.decorator";

export class CreateSubProtocolFileDto {
  @IsInt({ message: 'Id de archivo debe ser un número entero'})
  @FileExists({message: 'Id de archivo no existe'})
  file_id: number

  subprotocol_id: number
}