import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { FileTypesService } from '../file-types.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class FileTypeExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly fileTypesService: FileTypesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.fileTypesService.fileTypeExists(value);
  }
}

export function FileTypeExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: FileTypeExistsRule,
    });
  };
}
