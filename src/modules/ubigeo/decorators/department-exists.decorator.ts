import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UbigeoPeruDepartmentsService } from '../departments.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class UbigeoPeruDepartmentExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly ubigeoPeruDepartmentsService: UbigeoPeruDepartmentsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.ubigeoPeruDepartmentsService.ubigeoPeruDepartmentExists(value);
  }
}

export function UbigeoPeruDepartmentExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UbigeoPeruDepartmentExistsRule,
    });
  };
}
