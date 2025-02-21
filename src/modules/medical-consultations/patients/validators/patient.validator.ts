import { Inject, Injectable } from '@nestjs/common';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { PatientsService } from '../patients.service';
import { documentType } from 'src/modules/document-types/entities/document-types.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';

@Injectable()
@ValidatorConstraint({ async: true })
export class PatientExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly patientsService: PatientsService) {}

  async validate(value: number): Promise<boolean> {
    if (!value) return true;
    return await this.patientsService.patientExists(value);
  }

  defaultMessage(args: ValidationArguments) {
    return 'No existe el paciente';
  }
}

export function PatientExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PatientExistsRule,
    });
  };
}
