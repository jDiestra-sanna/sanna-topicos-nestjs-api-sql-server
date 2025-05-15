import { Controller, Get, Query, Res } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { ReqQuery } from "./dto/req-query.dto";
import { Response } from "express";
import { paginatedRspOk } from "src/common/helpers/http-responses";
import ExcelJSService from "src/exceljs/exceljs.service";
import { User } from "../users/entities/user.entity";
import { AuthUser } from "src/common/decorators/auth-user.decorator";
import { currentDateUnderscore } from "src/common/helpers/date";

@Controller('report-medical-consultations')
export class ReportMedicalConsultationsController {
    constructor(
        private reportsService: ReportsService,
        private excelJsService: ExcelJSService,
    ) { }

    @Get()
    async findAll(@Query() query: ReqQuery, @Res() res: Response, @AuthUser() user: User) {
        const result = await this.reportsService.findAllMedicalConsultations({...query, user_id: user.id})
        return paginatedRspOk(res, result.items, result.total, result.limit, result.page)
    }

    @Get('export')
    async exportAll(@Query() query: ReqQuery, @Res() res: Response, @AuthUser() user: User) {
        const data = await this.reportsService.exportAllMedicalConsultations({...query, user_id: user.id })

        const buffer = await this.excelJsService.setWorksheetName('reporte')
            .setColumns(
                [
                    { "key": "medcon_id", "header": "Numero de atencion" },
                    { "key": "medcon_attendance_date", "header": "Fecha de atencion" },
                    { "key": "medcon_attendance_time", "header": "Hora de atencion", width: 10, style: { numFmt: 'HH:mm:ss'} },
                    { "key": "ca_id", "header": "ID de Sede" },
                    { "key": "ca_name", "header": "Nombre de Sede" },
                    { "key": "us_name", "header": "Nombre del profesional" },
                    { "key": "us_surname_first", "header": "Apellido paterno del profesional" },
                    { "key": "us_surname_second", "header": "Apellido materno del profesional" },
                    { "key": "docty_name", "header": "Tipo de documento del profesional" },
                    { "key": "us_document_number", "header": "Numero de documento del profesional" },
                    { "key": "us_colegiatura", "header": "Colegiatura del profesional" },
                    { "key": "prof_name", "header": "Profesion" },
                    { "key": "pat_name", "header": "Nombre del paciente" },
                    { "key": "pat_surname_first", "header": "Apellido paterno del paciente" },
                    { "key": "pat_surname_second", "header": "Apellido materno del paciente" },
                    { "key": "pdocty_name", "header": "Tipo de documento del paciente" },
                    { "key": "pat_document_number", "header": "Numero de documento del paciente" },
                    { "key": "pat_birthdate", "header": "Fecha de nacimiento del paciente" },
                    { "key": "psex_name", "header": "Sexo del paciente" },
                    { "key": "pprof_name", "header": "Perfil del paciente" },
                    { "key": "paller_food_allergy", "header": "Alergia a los alimentos" },
                    { "key": "paller_drug_allergy", "header": "Alergia a los medicamentos" },
                    { "key": "pmedh_surgical_history", "header": "Historial quirurgico" },
                    { "key": "cty_name", "header": "Tipo de consulta" },
                    { "key": "atdpla_name", "header": "Lugar de consulta" },
                    { "key": "biosys_name", "header": "Sistema biologico" },
                    { "key": "maidiag_code", "header": "Codigo de diagnostico principal" },
                    { "key": "maidiag_name", "header": "Diagnostico principal" },
                    { "key": "secdiag_code", "header": "Codigo de diagnostico secundario" },
                    { "key": "secdiag_name", "header": "Diagnostico secundario" },
                    { "key": "medi_name", "header": "Medicamento recetado" },
                    { "key": "pmedh_hypertension", "header": "Hipertension" },
                    { "key": "pmedh_asthma", "header": "Asma" },
                    { "key": "pmedh_cancer", "header": "Cancer" },
                    { "key": "pmedh_diabetes", "header": "Diabetes" },
                    { "key": "pmedh_epilepsy", "header": "Epilepsia" },
                    { "key": "pmedh_observation", "header": "Observaciones" },
                    { "key": "pmedh_others", "header": "Otros" },
                    { "key": "pmedh_others_description", "header": "Otros - descripcion" },
                    { "key": "pmedh_psychological_condition", "header": "Condicion psicologica" },
                    { "key": "media_involves_mental_health", "header": "Involucra salud mental" }
                ]
            )
            .setData(data)
            .writeBuffer()
        
        const date = currentDateUnderscore();
        const filename = `reporte_de_consultas_${date}.xlsx`;

        res.header('Content-Disposition', `attachment; filename="${filename}"`);
        res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        return res.send(buffer)
    }
}