import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { SubProtocolsService } from '../subprotocols.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class SubprotocolExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly subprotocolsService: SubProtocolsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.subprotocolsService.subprotocolExists(value);
  }
}

export function SubprotocolExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: SubprotocolExistsRule,
    });
  };
}
