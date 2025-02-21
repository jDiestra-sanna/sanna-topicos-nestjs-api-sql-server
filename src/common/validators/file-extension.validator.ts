import { FileValidator } from '@nestjs/common';
import { IFile } from '@nestjs/common/pipes/file/interfaces';
import * as nodePath from 'node:path';

type AllowedExtensions = {
  extensions: RegExp;
  message?: string;
};

interface CustomIFile extends IFile {
  originalname: string;
}

export class CustomFileExtensionValidator extends FileValidator<AllowedExtensions, CustomIFile> {
  buildErrorMessage(file: any): string {
    if (this.validationOptions.message) {
      return this.validationOptions.message;
    }
    return `Extension incorrecta`;
  }

  isValid(file?: CustomIFile): Promise<boolean> | boolean {
    const extension = nodePath.extname(file.originalname);
    const pattern = this.validationOptions.extensions;

    if (pattern.test(extension)) {
      return true;
    }
    return false;
  }
}
