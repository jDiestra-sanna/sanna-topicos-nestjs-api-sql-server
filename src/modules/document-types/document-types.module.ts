import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentTypesService } from './document-type.service';
import { DocumentTypesController } from './document-types.controller';
import { DocumentType } from './entities/document-types.entity';
import { Patient } from '../medical-consultations/patients/entities/patient.entity';
import { DocumentTypeExistsRule } from './decorators/document-type-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentType, Patient])],
  controllers: [DocumentTypesController],
  providers: [DocumentTypesService, DocumentTypeExistsRule],
  exports: [DocumentTypesService],
})
export class DocumentTypeModule {}
