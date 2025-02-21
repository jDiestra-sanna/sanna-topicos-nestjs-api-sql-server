import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IllnessQuantityTypesService } from '../illness-quantity-types.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IllnessQuantityTypeExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly illnessQuantityTypesService: IllnessQuantityTypesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.illnessQuantityTypesService.illnessQuantityTypeExists(value);
  }
}

export function IllnessQuantityTypeExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IllnessQuantityTypeExistsRule,
    });
  };
}
