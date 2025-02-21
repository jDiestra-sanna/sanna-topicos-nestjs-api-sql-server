import { IsString, Validate } from "class-validator";
import { ArticleGroupNameExistsRule } from "../validators/article-group-name.validator";

export class CreateArticleGroupDto {
    @IsString({ message: 'Nombre del grupo de articulo debe ser texto'})
    @Validate(ArticleGroupNameExistsRule)
    name: string
}