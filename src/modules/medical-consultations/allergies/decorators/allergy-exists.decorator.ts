import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AllergiesService } from '../allergies.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class AllergyExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly allergiesService: AllergiesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.allergiesService.allergyExists(value);
  }
}

export function AllergyExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: AllergyExistsRule,
    });
  };
}
