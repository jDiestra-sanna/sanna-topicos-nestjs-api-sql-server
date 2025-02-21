import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { zxcvbn } from '../helpers/password';

@Injectable()
@ValidatorConstraint({ name: 'userPredictablePassword', async: true })
export class UserPredictablePassword implements ValidatorConstraintInterface {
  constructor() {}

  async validate(password: string, validationArguments?: ValidationArguments) {
    const result = zxcvbn(password);
    return result.score >= 2;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'La contraseña es muy predecible, intente otra';
  }
}
