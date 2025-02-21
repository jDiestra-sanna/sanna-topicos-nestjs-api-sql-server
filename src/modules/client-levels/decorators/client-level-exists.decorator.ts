import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ClientLevelsService } from '../client-levels.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class ClientLevelExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly clientLevelsService: ClientLevelsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.clientLevelsService.clientLevelExists(value);
  }
}

export function ClientLevelExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ClientLevelExistsRule,
    });
  };
}
