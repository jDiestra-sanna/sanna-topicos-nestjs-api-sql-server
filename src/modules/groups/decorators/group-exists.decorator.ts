import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { GroupsService } from '../groups.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class GroupExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly groupsService: GroupsService) {}

  async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> {
    if (!value) return true // Sin grupo
    return await this.groupsService.groupExists(value);
  }
}

export function GroupExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: GroupExistsRule,
    });
  };
}
