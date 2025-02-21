import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { isMinor } from 'src/common/helpers/age-calculator';

@Injectable()
@ValidatorConstraint({ name: 'CheckUserLegalAge' })
export class CheckUserLegalAge implements ValidatorConstraintInterface {
  constructor() {}

  async validate(birthDate: string, validationArguments?: ValidationArguments): Promise<boolean> {
    return !isMinor(birthDate)
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Usuario debe ser mayor de edad';
  }
}
