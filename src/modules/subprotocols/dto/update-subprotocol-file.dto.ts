import { IsInt, IsOptional, Validate } from "class-validator";
import { FileExists } from "src/files/decorators/file-exists.decorator";

export class UpdateSubProtocolFileDto {
  @IsInt({message: 'ID de archivo debe ser un numero entero'})
  @FileExists({message: 'Id de archivo no existe'})
  @IsOptional()
  file_id?: number

  subprotocol_id?: number
}