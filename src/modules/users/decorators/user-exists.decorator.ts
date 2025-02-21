import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersService } from '../users.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class UserExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly usersService: UsersService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    return await this.usersService.userExists(value);
  }
}

export function UserExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UserExistsRule,
    });
  };
}
