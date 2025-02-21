import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { DiagnosisTypeIds } from '../entities/diagnosis-type.entity';
import { ProffesionIds } from 'src/modules/proffesions/entities/proffesion.entity';

@Injectable()
@ValidatorConstraint({ async: true })
export class AssertProffesionByDiagnosisType implements ValidatorConstraintInterface {
  private message: string;
  constructor() {}

  async validate(diagnosisTypeId: number, validationArguments?: ValidationArguments): Promise<boolean> {
    const proffesionId = (validationArguments.object as any).proffesion_id;
    
    if (!proffesionId) {
      this.message = 'Ingrese una profesion';
      return false;
    }

    if (diagnosisTypeId == DiagnosisTypeIds.NANDA && proffesionId != ProffesionIds.REGISTERED_NURSE) {
      this.message = 'Tipo de diagnostico NANDA le corresponde Licenciado en Enfermeria';
      return false;
    }

    if (diagnosisTypeId == DiagnosisTypeIds.CIE10 && proffesionId != ProffesionIds.GENERAL_PRACTITIONER) {
      this.message = 'Tipo de diagnostico CIE10 le corresponde Medico General';
      return false;
    }

    return true;
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return this.message;
  }
}
