import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UbigeoPeruProvincesService } from '../provinces.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class UbigeoPeruProvinceExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly ubigeoPeruProvincesService: UbigeoPeruProvincesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.ubigeoPeruProvincesService.ubigeoPeruProvinceExists(value);
  }
}

export function UbigeoPeruProvinceExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UbigeoPeruProvinceExistsRule,
    });
  };
}
