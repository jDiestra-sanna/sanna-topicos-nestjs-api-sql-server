import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CampusService } from '../campus.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class CampusExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly campusService: CampusService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    if (!value) return true;
    return await this.campusService.campusExists(value);
  }
}

export function CampusExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CampusExistsRule,
    });
  };
}
