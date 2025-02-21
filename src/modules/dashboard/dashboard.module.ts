import { BiologicalSystemsModule } from '../biological-systems/biological-systems.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MedicalCalendarsModule } from '../medical-calendars/medical-calendars.module';
import { MedicalConsultationsModule } from '../medical-consultations/medical-consultations.module';
import { Module } from '@nestjs/common';
import { PatientProfilesModule } from '../patient-profile/patient-profiles.module';
import { UsersModule } from '../users/users.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [MedicalConsultationsModule, PatientProfilesModule, BiologicalSystemsModule, ClientsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
