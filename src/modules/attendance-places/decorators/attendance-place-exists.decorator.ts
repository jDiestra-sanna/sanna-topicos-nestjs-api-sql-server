import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AttendancePlacesService } from '../attendance-places.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class AttendancePlaceExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly attendancePlacesService: AttendancePlacesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.attendancePlacesService.attendancePlaceExists(value);
  }
}

export function AttendancePlaceExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: AttendancePlaceExistsRule,
    });
  };
}
