import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ProtocolsService } from '../protocols.service';
import { FilesService } from 'src/files/files.service';

@Injectable()
@ValidatorConstraint({ name: 'FileExists', async: true })
export class FileExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly filesService: FilesService) {}

  async validate(id: number): Promise<boolean> {
    const exists = await this.filesService.fileExists(id);
    return exists;
  }

  defaultMessage(args: ValidationArguments) {
    return 'El archivo no existe en el repositorio';
  }
}
