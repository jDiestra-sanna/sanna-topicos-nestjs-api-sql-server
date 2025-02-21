import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ProtocolTypesService } from '../protocol-types.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class ProtocolTypeExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly protocolTypesService: ProtocolTypesService) {}

  async validate(id: number): Promise<boolean> {
    return await this.protocolTypesService.protocolTypeExists(id);
  }

  defaultMessage(args: ValidationArguments) {
    return 'No existe el tipo de protocolo';
  }
}

export function ProtocolTypeExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ProtocolTypeExistsRule,
    });
  };
}