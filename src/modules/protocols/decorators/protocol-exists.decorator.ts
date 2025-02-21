import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ProtocolsService } from '../protocols.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class ProtocolExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly protocolsService: ProtocolsService) {}

  async validate(id: number): Promise<boolean> {
    return await this.protocolsService.protocolExists(id);
  }

  defaultMessage(args: ValidationArguments) {
    return 'No existe el protocolo';
  }
}

export function ProtocolExists(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [],
        validator: ProtocolExistsRule,
      });
    };
  }
  