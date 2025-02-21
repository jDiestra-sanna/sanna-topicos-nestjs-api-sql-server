import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
@ValidatorConstraint({ name: 'userUniqueEmail', async: true })
export class UserUniqueEmailValidator implements ValidatorConstraintInterface {
  constructor(private readonly userService: UsersService) {}

  async validate(email: string, args: ValidationArguments) {
    const exists = await this.userService.existsEmail(email);

    return !exists;
  }

  defaultMessage(args: ValidationArguments) {
    return 'El correo electrónico ya está en uso';
  }
}
