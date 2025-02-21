import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CostCentersService } from '../cost-centers.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class CostCenterExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly costCentersService: CostCentersService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.costCentersService.costCenterExists(value);
  }
}

export function CostCenterExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CostCenterExistsRule,
    });
  };
}
