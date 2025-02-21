import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LogTargetsService } from '../log-targets.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class LogTargetExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly logTargetsService: LogTargetsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.logTargetsService.logTargetExists(value);
  }
}

export function LogTargetExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: LogTargetExistsRule,
    });
  };
}
