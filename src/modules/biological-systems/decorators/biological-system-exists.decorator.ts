import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BiologicalSystemsService } from '../biological-systems.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class BiologicalSystemExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly biologicalSystemsService: BiologicalSystemsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.biologicalSystemsService.biologicalSystemExists(value);
  }
}

export function BiologicalSystemExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: BiologicalSystemExistsRule,
    });
  };
}