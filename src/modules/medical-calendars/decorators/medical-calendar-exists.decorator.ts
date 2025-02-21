import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { MedicalCalendarsService } from '../medical-calendars.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class MedicalCalendarExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly medicalCalendarsService: MedicalCalendarsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.medicalCalendarsService.medicalCalendarExists(value);
  }
}

export function MedicalCalendarExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MedicalCalendarExistsRule,
    });
  };
}
