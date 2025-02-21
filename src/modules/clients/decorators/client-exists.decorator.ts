import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ClientsService } from '../clients.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class ClientExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly clientsService: ClientsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    if (!value) return true;
    return await this.clientsService.clientExists(value);
  }
}

export function ClientExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ClientExistsRule,
    });
  };
}
