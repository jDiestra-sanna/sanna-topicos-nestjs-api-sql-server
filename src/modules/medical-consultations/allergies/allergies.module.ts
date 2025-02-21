import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AllergiesService } from "./allergies.service";
import { Allergy } from "./entities/allergies.entity";
import { PatientExistsRule } from "../patients/validators/patient.validator";
import { PatientsModule } from "../patients/patients.module";
import { AllergyExistsRule } from "./decorators/allergy-exists.decorator";

@Module({
  imports: [TypeOrmModule.forFeature([Allergy]), PatientsModule],
  controllers: [],
  providers: [AllergiesService, PatientExistsRule, AllergyExistsRule],
  exports: [AllergiesService]

})
export class AllergiesModule{}