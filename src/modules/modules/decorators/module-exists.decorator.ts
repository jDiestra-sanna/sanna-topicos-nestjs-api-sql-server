import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ModulesService } from '../modules.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class ModuleExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly modulesService: ModulesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.modulesService.moduleExists(value);
  }
}

export function ModuleExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ModuleExistsRule,
    });
  };
}