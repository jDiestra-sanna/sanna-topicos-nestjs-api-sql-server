import { Module } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { ReportMedicalConsultationsController } from "./report-medical-consultations.controller";
import { MedicalConsultationsModule } from "src/modules/medical-consultations/medical-consultations.module";
import ExcelJSService from "src/exceljs/exceljs.service";

@Module({
  imports: [MedicalConsultationsModule],
  controllers: [ReportMedicalConsultationsController],
  providers: [ReportsService, ExcelJSService],
  exports: [ReportsService],
}) export class ReportsModule {}
