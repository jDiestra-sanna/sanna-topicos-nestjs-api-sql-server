import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { MedicineService } from '../medicines.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class MedicineExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly medicinesService: MedicineService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.medicinesService.medicineExists(value);
  }
}

export function MedicineExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MedicineExistsRule,
    });
  };
}
