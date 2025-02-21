import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CampusService } from 'src/modules/campus/campus.service';

@Injectable()
@ValidatorConstraint({ name: 'CampusIsEnabled' })
export class CampusIsEnabledRule implements ValidatorConstraintInterface {
  constructor(private readonly campusService: CampusService) {}

  async validate(campusId: number, validationArguments?: ValidationArguments): Promise<boolean> {
    const isEnabled = await this.campusService.campusIsEnabled(campusId);

    return isEnabled;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Campus está deshabilitado o eliminado';
  }
}
