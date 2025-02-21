import { AllergiesModule } from 'src/modules/medical-consultations/allergies/allergies.module';
import { AttendanceDetailsModule } from 'src/modules/medical-consultations/attendance-details/attendance-details.module';
import { CampusModule } from 'src/modules/campus/campus.module';
import { ClientsModule } from 'src/modules/clients/clients.module';
import { FakerService } from './faker.service';
import { GroupModule } from 'src/modules/groups/groups.module';
import { MedicalConsultationsModule } from 'src/modules/medical-consultations/medical-consultations.module';
import { MedicalDiagnosesModule } from 'src/modules/medical-consultations/medical-diagnoses/medical-diagnoses.module';
import { MedicalHistoriesModule } from 'src/modules/medical-consultations/medical-histories/medical-histories.module';
import { Module } from '@nestjs/common';
import { PatientsModule } from 'src/modules/medical-consultations/patients/patients.module';
import { PrescriptionsModule } from 'src/modules/medical-consultations/prescriptions/prescriptions.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    AllergiesModule,
    AttendanceDetailsModule,
    CampusModule,
    ClientsModule,
    GroupModule,
    MedicalConsultationsModule,
    MedicalDiagnosesModule,
    MedicalHistoriesModule,
    PatientsModule,
    PrescriptionsModule,
    UsersModule,
  ],
  providers: [FakerService],
  exports: [FakerService],
})
export class FakerModule {}
