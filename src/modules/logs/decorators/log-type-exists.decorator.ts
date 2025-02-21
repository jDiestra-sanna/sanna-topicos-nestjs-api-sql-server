import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LogTypesService } from '../log-types.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class LogTypeExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly logTypesService: LogTypesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.logTypesService.logTypeExists(value);
  }
}

export function LogTypeExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: LogTypeExistsRule,
    });
  };
}
