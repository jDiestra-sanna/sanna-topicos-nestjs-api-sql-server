import { Module } from '@nestjs/common';
import { MedicalConsultationsModule } from '../medical-consultations/medical-consultations.module';
import { ConsultationHistoriesController } from './consultation-history.controller';
import { ConsultationHistoriesService } from './consultation-history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalConsultation } from '../medical-consultations/entities/medical-consultation.entity';
import { UserAssigment } from '../users/entities/user-assignment.entity';
import { AttendanceRecord } from '../attendance-records/entities/attendance-record.entity';
import { UsersModule } from '../users/users.module';
import { Campus } from '../campus/entities/campus.entity';
import { Client } from '../clients/entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalConsultation, UserAssigment, AttendanceRecord, Campus, Client]),
    MedicalConsultationsModule,
    UsersModule,
  ],
  controllers: [ConsultationHistoriesController],
  providers: [ConsultationHistoriesService],
  exports: [ConsultationHistoriesService],
})
export class ConsultationHistoriesModule {}
