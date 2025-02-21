import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ProffesionsService } from '../proffesions.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class ProffesionExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly proffesionsService: ProffesionsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.proffesionsService.proffesionExists(value);
  }
}

export function ProffessionExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ProffesionExistsRule,
    });
  };
}
