import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { ArticleGroupsService } from "../article-groups.service";

@Injectable()
@ValidatorConstraint({name: 'ArticleGroupNameExists', async: true})
export class ArticleGroupNameExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly articleGroupService: ArticleGroupsService){}

  async validate(name: string): Promise<boolean> {
    const exists = await this.articleGroupService.existsArticleGroupName(name)
    return !exists
  }

  defaultMessage(args: ValidationArguments) {
    return 'Ya existe un grupo de articulo con ese nombre'
  }
}