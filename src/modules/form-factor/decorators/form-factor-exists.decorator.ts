import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { FormFactorsService } from '../form-factor.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class FormFactorExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly formFactorsService: FormFactorsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.formFactorsService.formFactorExists(value);
  }
}

export function FormFactorExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: FormFactorExistsRule,
    });
  };
}
