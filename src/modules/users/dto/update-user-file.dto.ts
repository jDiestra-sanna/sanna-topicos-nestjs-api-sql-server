import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { FileExists } from 'src/files/decorators/file-exists.decorator';
import { FileTypeExists } from 'src/modules/file-types/decorators/file-type-exists.decorator';

export class UpdateUserFileDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @FileTypeExists({ message: 'Tipo de archivo no existe' })
  file_type_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @FileExists({ message: 'Archivo no existe' })
  file_id?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
