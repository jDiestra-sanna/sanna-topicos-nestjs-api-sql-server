import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { documentType } from 'src/modules/document-types/entities/document-types.entity';

@Injectable()
@ValidatorConstraint({ name: 'documentNumberLengthValidator', async: true })
export class DocumentNumberLengthValidator implements ValidatorConstraintInterface {
  private message: string;
  constructor() {}

  async validate(documentNumber: string, validationArguments?: ValidationArguments) {
    const documentTypeId = (validationArguments.object as any).document_type_id;

    if (!documentTypeId || !documentNumber) {
      return false;
    }

    if (documentTypeId === documentType.DNI) {
      this.message = 'DNI debe tener 8 caracteres';
      return documentNumber.length === 8;
    }

    if (documentTypeId === documentType.FOREIGN_CARD) {
      this.message = 'CE debe tener como máximo 12 caracteres';
      return documentNumber.length <= 12;
    }
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return this.message ? this.message : 'El tipo de documento y el número de documento son requeridos';
  }
}

@Injectable()
@ValidatorConstraint({ name: 'documentValidator', async: true })
export class DocumentValidator implements ValidatorConstraintInterface {
  constructor() {}

  async validate(value: any, validationArguments?: ValidationArguments) {
    const dto = validationArguments.object as any;
    const documentTypeId = dto.document_type_id;
    const documentNumber = dto.document_number;

    if (!documentTypeId || !documentNumber) return false;

    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'El tipo de documento y el número de documento son requeridos';
  }
}
