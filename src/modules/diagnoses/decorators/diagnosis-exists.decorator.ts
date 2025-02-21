import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DiagnosesService } from '../diagnoses.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class DiagnosisExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly diagnosesService: DiagnosesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.diagnosesService.diagnosisExists(value);
  }
}

export function DiagnosisExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: DiagnosisExistsRule,
    });
  };
}
