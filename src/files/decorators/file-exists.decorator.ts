import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { FilesService } from '../files.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class FileExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly filesService: FilesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.filesService.fileExists(value);
  }
}

export function FileExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: FileExistsRule,
    });
  };
}
