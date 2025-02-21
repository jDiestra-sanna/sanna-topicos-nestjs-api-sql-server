import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "./entities/patient.entity";
import { PatientsService } from "./patients.service";
import { LogsModule } from "src/modules/logs/logs.module";
import { MedicalConsultation } from "../entities/medical-consultation.entity";
import { PatientExistsRule } from "./validators/patient.validator";

@Module({
  imports: [TypeOrmModule.forFeature([Patient, MedicalConsultation]), LogsModule],
  controllers: [],
  providers: [PatientsService, PatientExistsRule],
  exports: [PatientsService]
})
export class PatientsModule {}