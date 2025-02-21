import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ConsultationTypesService } from '../consultation-types.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class ConsultationTypeExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly consultationTypesService: ConsultationTypesService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    if (!value) return true;
    return await this.consultationTypesService.consultationTypeExists(value);
  }
}

export function ConsultationTypeExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ConsultationTypeExistsRule,
    });
  };
}
