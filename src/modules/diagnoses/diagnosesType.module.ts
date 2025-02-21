import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosisType } from './entities/diagnosis-type.entity';
import { DiagnosisTypesService } from './diagnosesType.service';
import { DiagnosisTypeExistsRule } from './decorators/diagnosis-type-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([DiagnosisType])],
  providers: [DiagnosisTypesService, DiagnosisTypeExistsRule],
  exports: [DiagnosisTypesService],
})
export class DiagnosisTypesModule {}
