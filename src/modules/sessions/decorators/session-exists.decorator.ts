import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { SessionsService } from '../sessions.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class SessionExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly sessionsService: SessionsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.sessionsService.sessionExists(value);
  }
}

export function SessionExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: SessionExistsRule,
    });
  };
}
