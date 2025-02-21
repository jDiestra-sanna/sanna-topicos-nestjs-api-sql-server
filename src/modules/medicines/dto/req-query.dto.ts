import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery, OrderDir } from 'src/common/dto/url-query.dto';
import { ArticleGroupExists } from 'src/modules/article-groups/decorators/article-group-exists.decorator';
import { FormFactorExists } from 'src/modules/form-factor/decorators/form-factor-exists.decorator';

export enum OrderCol {
  ID = 'medicine.id',
  NAME = 'medicine.name',
  CODE = 'medicine.code',
  DCI = 'medicine.dci',
  STATE = 'medicine.state',
  DATE_CREATED = 'medicine.date_created',
  ARTICLE_GROUP_NAME = 'article_group.name',
  FORM_FACTOR_NAME = 'form_factor.name',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.NAME;

  @IsOptional()
  @IsEnum(OrderDir)
  order_dir: OrderDir = OrderDir.ASC;

  @IsOptional()
  @IsInt()
  @ArticleGroupExists({ message: 'Grupo de articulo no existe' })
  @Type(() => Number)
  article_group_id: number;

  @IsOptional()
  @IsInt()
  @FormFactorExists({ message: 'Presentacion no existe' })
  @Type(() => Number)
  form_factor_id: number;
}
