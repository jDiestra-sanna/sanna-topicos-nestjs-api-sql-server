import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { FileExists } from 'src/files/decorators/file-exists.decorator';
import { FileTypeExists } from 'src/modules/file-types/decorators/file-type-exists.decorator';
import { UserExists } from '../decorators/user-exists.decorator';

export class UserFileCreationRequestDto {
  @IsInt()
  @Min(1, { message: 'Tipo Archivo es requerido' })
  @Type(() => Number)
  @FileTypeExists({ message: 'Tipo de archivo no existe' })
  file_type_id: number;

  @IsInt()
  @Min(1, { message: 'Archivo es requerido' })
  @Type(() => Number)
  @FileExists({ message: 'Archivo no existe' })
  file_id: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class NewUserFileDto extends UserFileCreationRequestDto {
  @IsInt()
  @Min(1)
  @UserExists({ message: 'Usuario no existe' })
  user_id: number;
}
