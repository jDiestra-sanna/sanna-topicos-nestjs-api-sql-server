import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PatientProfilesService } from '../patient-profiles.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class PatientProfileExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly patientProfilesService: PatientProfilesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.patientProfilesService.patientProfileExists(value);
  }
}

export function PatientProfileExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PatientProfileExistsRule,
    });
  };
}
