import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { MedicalConsultationsService } from '../medical-consultations.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class MedicalConsultationExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly medicalConsultationsService: MedicalConsultationsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.medicalConsultationsService.medicalConsultationExists(value);
  }
}

export function MedicalConsultationExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MedicalConsultationExistsRule,
    });
  };
}
