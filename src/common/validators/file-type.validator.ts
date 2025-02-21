import { FileValidator } from '@nestjs/common';
import { IFile } from '../interfaces/file.interface';
import * as fs from 'node:fs/promises';

export type FileTypeValidatorOptions = {
  fileType: RegExp;
  message?: string;
};

export class CustomFileTypeValidator extends FileValidator<
  FileTypeValidatorOptions,
  IFile
> {
  buildErrorMessage(): string {
    if (this.validationOptions.message) {
      return this.validationOptions.message;
    }

    return `El archivo debe ser de tipo: ${this.validationOptions.fileType.toString()}`;
  }

  async isValid(file?: IFile): Promise<boolean> {
    const pattern = this.validationOptions.fileType;

    if (pattern.test(file.mimetype)) {
      return true;
    } else {
      await fs.unlink(file.path);
      return false;
    }
  }
}
