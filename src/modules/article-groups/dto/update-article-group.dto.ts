import { IsString, Validate } from "class-validator";
import { ArticleGroupNameExistsRule } from "../validators/article-group-name.validator";

export class UpdateArticleGroupDto {
    @IsString({ message: 'Nombre de presentacion debe ser texto'})
    @Validate(ArticleGroupNameExistsRule)
    name: string
}