import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DocumentTypesService } from '../document-type.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class DocumentTypeExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly documentTypesService: DocumentTypesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.documentTypesService.documentTypeExists(value);
  }
}

export function DocumentTypeExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: DocumentTypeExistsRule,
    });
  };
}
