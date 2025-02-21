import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diagnosis } from './entities/diagnosis.entity';
import { DiagnosesService } from './diagnoses.service';
import { ProffesionExistsRule } from './validators/diagnoses-proffesion.validator';
import { Proffesion } from '../proffesions/entities/proffesion.entity';
import { DiagnosesController } from './diagnoses.controller';
import { DiagnosisByCodeExistsRule } from './validators/diagnoses-code.validator';
import { ProffesionsService } from '../proffesions/proffesions.service';
import { LogsModule } from '../logs/logs.module';
import { DiagnosisTypesService } from './diagnosesType.service';
import { DiagnosisTypeExistsRule } from './validators/diagnoses-type.validator';
import { DiagnosisType } from './entities/diagnosis-type.entity';
import { MedicalDiagnosis } from '../medical-consultations/medical-diagnoses/entity/medical-diagnosis.entity';
import { DiagnosisExistsRule } from './decorators/diagnosis-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([Diagnosis, Proffesion, DiagnosisType, MedicalDiagnosis]), LogsModule],
  controllers: [DiagnosesController],
  providers: [
    DiagnosesService,
    ProffesionExistsRule,
    DiagnosisByCodeExistsRule,
    ProffesionsService,
    DiagnosisTypeExistsRule,
    DiagnosisTypesService,
    DiagnosisExistsRule
  ],
  exports: [DiagnosesService],
})
export class DiagnosesModule {}
