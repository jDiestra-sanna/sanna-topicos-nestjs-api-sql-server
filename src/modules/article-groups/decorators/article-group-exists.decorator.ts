import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ArticleGroupsService } from '../article-groups.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class ArticleGroupExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly articleGroupsService: ArticleGroupsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.articleGroupsService.articleGroupExists(value);
  }
}

export function ArticleGroupExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ArticleGroupExistsRule,
    });
  };
}
