import { IsInt, IsNumberString, IsOptional, IsString, Length, MinLength, Validate } from 'class-validator';
import { MedicineExistsByCodeRule } from '../validators/medicines-code.validator';
import { ArticleGroupExists } from 'src/modules/article-groups/decorators/article-group-exists.decorator';
import { FormFactorExists } from 'src/modules/form-factor/decorators/form-factor-exists.decorator';

export class CreateMedicineDto {
  @IsString({ message: 'Nombre debe ser texto' })
  @MinLength(3, { message: 'Nombre mínimo 3 caracteres' })
  name: string;

  @IsString({ message: 'Codigo debe ser texto' })
  @Length(1, 15, { message: 'Código debe tener como minimo 1 digitos y máximo 15' })
  @Validate(MedicineExistsByCodeRule)
  @IsNumberString({ no_symbols: true }, { message: 'Código solo números' })
  code: string;

  @IsString({ message: 'DCI debe ser texto' })
  @IsOptional()
  dci?: string;

  @IsInt({ message: 'Grupo de articulo es requerido' })
  @ArticleGroupExists({ message: 'Grupo de articulo no existe' })
  article_group_id: number;

  @IsInt({ message: 'Presentacion es requerido' })
  @FormFactorExists({ message: 'Presentacion no existe' })
  form_factor_id: number;
}
