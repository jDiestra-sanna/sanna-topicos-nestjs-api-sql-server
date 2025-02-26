import { Module } from '@nestjs/common';
import { DropdownOptionsController } from './dropdown-options.controller';
import { GroupModule } from 'src/modules/groups/groups.module';
import { ClientsModule } from 'src/modules/clients/clients.module';
import { CampusModule } from 'src/modules/campus/campus.module';
import { UbigeoModule } from 'src/modules/ubigeo/ubigeo.module';
import { RolesModule } from 'src/modules/roles/roles.module';
import { DocumentTypeModule } from 'src/modules/document-types/document-types.module';
import { SexModule } from 'src/modules/sexes/sexes.module';
import { ProffesionModule } from 'src/modules/proffesions/proffesions.module';
import { CostCenterModule } from 'src/modules/cost-centers/cost-centers.module';
import { FileTypeModule } from 'src/modules/file-types/file-types.module';
import { ArticleGroupsModule } from 'src/modules/article-groups/article-groups.module';
import { FormFactorModule } from 'src/modules/form-factor/form-factor.module';
import { DiagnosisTypesModule } from 'src/modules/diagnoses/diagnosesType.module';
import { ProtocolTypesModule } from 'src/modules/protocols/protocol-types.module';
import { PatientProfilesModule } from 'src/modules/patient-profile/patient-profiles.module';
import { ConsultationTypesModule } from 'src/modules/consultation-types/consultation-types.module';
import { IllnessQuantityTypesModule } from 'src/modules/illness-quantity-types/illness-quantity-types.module';
import { BiologicalSystemsModule } from 'src/modules/biological-systems/biological-systems.module';
import { AttendancePlacesModule } from 'src/modules/attendance-places/attendance-places.module';
import { DiagnosesModule } from 'src/modules/diagnoses/diagnoses.module';
import { MedicineModule } from 'src/modules/medicines/medicines.module';
import { PatientsModule } from 'src/modules/medical-consultations/patients/patients.module';
import { ConsultationHistoriesModule } from 'src/modules/consultation-history/consultation-history.module';
import { ClientLevelsModule } from 'src/modules/client-levels/client-levels.module';
import { MedicalCalendarsModule } from 'src/modules/medical-calendars/medical-calendars.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MedicalCalendarsModule,
    ClientLevelsModule,
    ConsultationHistoriesModule,
    PatientsModule,
    MedicineModule,
    DiagnosesModule,
    AttendancePlacesModule,
    BiologicalSystemsModule,
    IllnessQuantityTypesModule,
    ConsultationTypesModule,
    PatientProfilesModule,
    ArticleGroupsModule,
    FormFactorModule,
    DiagnosisTypesModule,
    ProtocolTypesModule,
    GroupModule,
    ClientsModule,
    CampusModule,
    UbigeoModule,
    RolesModule,
    DocumentTypeModule,
    SexModule,
    ProffesionModule,
    CostCenterModule,
    FileTypeModule,
    AuthModule,
  ],
  controllers: [DropdownOptionsController],
})
export class DropdownOptionsModule {}
