import { IsInt, IsNumberString, IsOptional, IsString, Length, Validate } from 'class-validator';
import { FormFactorExists } from 'src/modules/form-factor/decorators/form-factor-exists.decorator';
import { ArticleGroupExists } from 'src/modules/article-groups/decorators/article-group-exists.decorator';

export class UpdateMedicineDto {
  @IsString({ message: 'Nombre debe ser texto' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Codigo debe ser texto' })
  @Length(1, 15, { message: 'Código debe tener como minimo 1 digitos y máximo 15' })
  @IsOptional()
  @IsNumberString({ no_symbols: true }, { message: 'Código solo números' })
  code?: string;

  @IsString({ message: 'DCI debe ser texto' })
  @IsOptional()
  dci?: string;

  @IsInt({ message: 'Grupo de articulo debe ser un numero entero' })
  @IsOptional()
  @ArticleGroupExists({ message: 'Grupo de articulo no existe' })
  article_group_id?: number;

  @IsInt({ message: 'Presentacion debe ser un numero entero' })
  @IsOptional()
  @FormFactorExists({ message: 'Presentacion no existe' })
  form_factor_id?: number;
}
