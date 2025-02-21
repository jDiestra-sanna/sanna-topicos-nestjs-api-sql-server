import { Module } from '@nestjs/common';
import { PatientsModule } from './patients/patients.module';
import { MedicalConsultationsController } from './medical-consultations.controller';
import { MedicalConsultationsService } from './medical-consultations.service';
import { LogsModule } from '../logs/logs.module';
import { AllergiesModule } from './allergies/allergies.module';
import { MedicalHistoriesModule } from './medical-histories/medical-histories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalConsultation } from './entities/medical-consultation.entity';
import { AttendanceDetailsModule } from './attendance-details/attendance-details.module';
import { MedicalDiagnosesModule } from './medical-diagnoses/medical-diagnoses.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { MedicalCalendarDay } from '../medical-calendars/entities/medical-calendar-days.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { MedicalConsultationExistsRule } from './decorators/medical-consultation-exists.decorator';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalConsultation, MedicalCalendarDay]),
    PatientsModule,
    LogsModule,
    AllergiesModule,
    MedicalHistoriesModule,
    AttendanceDetailsModule,
    MedicalDiagnosesModule,
    PrescriptionsModule,
    NotificationsModule,
  ],
  controllers: [MedicalConsultationsController],
  providers: [MedicalConsultationsService, MedicalConsultationExistsRule],
  exports: [MedicalConsultationsService, TypeOrmModule],
})
export class MedicalConsultationsModule {}
