import { FileValidator } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import { IFile } from '../interfaces/file.interface';

type MaxFileSizeValidatorOptions = {
  maxSize: number;
  message?: string;
};

export class CustomMaxFileSizeValidator extends FileValidator<
  MaxFileSizeValidatorOptions,
  IFile
> {
  buildErrorMessage(): string {
    if (this.validationOptions.message) {
      return this.validationOptions.message;
    }
    
    return `El archivo deberia tener un tamaño máximo de ${this.validationOptions.maxSize / (1024 * 1024)}MB`;
  }

  async isValid(file?: IFile): Promise<boolean> {
    if (file.size > this.validationOptions.maxSize) {
      await fs.unlink(file.path);

      return false;
    } else {
      return true;
    }
  }
}
