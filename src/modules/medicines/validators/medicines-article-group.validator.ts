import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { ArticleGroupsService } from "src/modules/article-groups/article-groups.service";

@Injectable()
@ValidatorConstraint({name: 'ArticleGroupExists', async: true})
export class ArticleGroupExistsRule implements ValidatorConstraintInterface {
    constructor(private readonly articleGroupService: ArticleGroupsService) {}

    async validate(id: number): Promise<boolean> {
        const exists = await this.articleGroupService.articleGroupExists(id)
        return exists
    }

    defaultMessage(args: ValidationArguments) {
        return 'No existe este grupo de articulo';
    }
}