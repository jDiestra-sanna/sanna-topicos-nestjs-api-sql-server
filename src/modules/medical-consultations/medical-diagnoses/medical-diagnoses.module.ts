import { Module } from '@nestjs/common';
import { MedicalDiagnosesService } from './medical-diagnoses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalDiagnosis } from './entity/medical-diagnosis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalDiagnosis])],
  controllers: [],
  providers: [MedicalDiagnosesService],
  exports: [MedicalDiagnosesService, TypeOrmModule],
})
export class MedicalDiagnosesModule {}
