import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UbigeoPeruDistrictsService } from '../districts.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class UbigeoPeruDistrictExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly ubigeoPeruDistrictsService: UbigeoPeruDistrictsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.ubigeoPeruDistrictsService.ubigeoPeruDistrictExists(value);
  }
}

export function UbigeoPeruDistrictExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UbigeoPeruDistrictExistsRule,
    });
  };
}
