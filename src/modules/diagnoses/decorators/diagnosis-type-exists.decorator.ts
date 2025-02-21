import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DiagnosisTypesService } from '../diagnosesType.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class DiagnosisTypeExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly diagnosisTypesService: DiagnosisTypesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.diagnosisTypesService.diagnosisTypeExists(value);
  }
}

export function DiagnosisTypeExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: DiagnosisTypeExistsRule,
    });
  };
}
