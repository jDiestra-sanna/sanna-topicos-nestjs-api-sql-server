import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { SexesService } from '../sexes.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class SexExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly sexesService: SexesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.sexesService.sexExists(value);
  }
}

export function SexExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: SexExistsRule,
    });
  };
}
