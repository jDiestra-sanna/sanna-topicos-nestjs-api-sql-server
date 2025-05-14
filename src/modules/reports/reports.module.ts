import { Module } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { ReportMedicalConsultationsController } from "./report-medical-consultations.controller";
import { MedicalConsultationsModule } from "src/modules/medical-consultations/medical-consultations.module";
import ExcelJSService from "src/exceljs/exceljs.service";
import { UsersModule } from "../users/users.module";
import { UserAssignmentsService } from "../users/user-assignments.service";

@Module({
  imports: [MedicalConsultationsModule, UsersModule],
  controllers: [ReportMedicalConsultationsController],
  providers: [ReportsService, ExcelJSService, UserAssignmentsService],
  exports: [ReportsService],
}) export class ReportsModule {}
