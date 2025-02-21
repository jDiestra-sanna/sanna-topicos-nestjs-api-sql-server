import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { diffMilitaryTime, isValidTime } from 'src/common/helpers/date';

@Injectable()
@ValidatorConstraint({ name: 'OpeningClosingTimeValidator', async: true })
export class OpeningClosingTimeValidator implements ValidatorConstraintInterface {
  private message: string = 'Hora de cierre no puede ser antes o igual que la hora de apertura';
  constructor() {}

  async validate(closing_time: any, validationArguments?: ValidationArguments): Promise<boolean> {
    const opening_time = (validationArguments.object as any).opening_time;

    if (!(typeof opening_time === 'string' && typeof closing_time === 'string')) {
      this.message = 'Hora de ingreso y cierre deben ser cadenas de caracteres';
      return false;
    }

    if (!(isValidTime(opening_time) && isValidTime(closing_time))) {
      this.message = 'Por favor ingrese una hora de ingreso y cierre validas';
      return false;
    }

    const diffTime = diffMilitaryTime({
      endTime: closing_time,
      startTime: opening_time,
      units: 'minutes',
    });

    return diffTime.minutes > 0;
  }

  defaultMessage(args: ValidationArguments) {
    return this.message;
  }
}
