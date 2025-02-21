import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Res, UseFilters } from '@nestjs/common';
import { Response } from 'express';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { PatientsService } from './patients/patients.service';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkUpdated } from 'src/common/helpers/http-responses';
import { LogsService } from '../logs/logs.service';
import { AllergiesService } from './allergies/allergies.service';
import { MedicalHistoriesService } from './medical-histories/medical-histories.service';
import { MedicalConsultationsService } from './medical-consultations.service';
import { AttendanceDetailsService } from './attendance-details/attendance-details.service';
import { MedicalDiagnosesService } from './medical-diagnoses/medical-diagnoses.service';
import { PrescriptionsService } from './prescriptions/prescriptions.service';
import { CreatePatientMedicalConsultationDto } from './dto/create-patient-medical-consultation.dto';
import { CreateConsultationDetailsDto } from './dto/create-consultation-details.dto';
import { ReqQuery } from './dto/req-query.dto';
import { documentType } from '../document-types/entities/document-types.entity';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { UpdatePatientMedicalConsultationDto } from './dto/update-patient-medical-consultation.dto';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogTargetsIds } from '../logs/entities/log-target';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateEmergencyNotificationDto } from './dto/create-emergency-notification.dto';
import { ValidationExceptionFilter } from 'src/common/filters/validation-exception.filter';

@Controller('medical-consultations')
export class MedicalConsultationsController {
  constructor(
    private readonly prescriptionsService: PrescriptionsService,
    private readonly medicalDiagnosesService: MedicalDiagnosesService,
    private readonly attendanceDetailsService: AttendanceDetailsService,
    private readonly medicalConsultationsService: MedicalConsultationsService,
    private readonly patientsService: PatientsService,
    private readonly allergiesService: AllergiesService,
    private readonly medicalHistoriesService: MedicalHistoriesService,
    private readonly logsService: LogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get('patient')
  async findOnePatientByDocument(
    @Query('document_number') documentNumber: string,
    @Query('document_type') documentType: documentType,
    @Res() res: Response,
  ) {
    if (!documentNumber || !documentType) throw new BadRequestException('Por favor ingrese número documento y tipo');

    const patient = await this.patientsService.findOneByDocument(documentNumber, documentType);

    if (!patient) return rsp404(res);

    return rspOk(res, patient);
  }

  @Get(':id')
  async findOne(@Param() params: ParamIdDto, @Res() res: Response) {
    const data = await this.medicalConsultationsService.findOne(params.id);
    if (!data) return rsp404(res);
    return rspOk(res, data);
  }

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.medicalConsultationsService.findAll(query);
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }

  @UseFilters(ValidationExceptionFilter)
  @Post('patient')
  async createPatient(
    @Body() createPatientMedicalConsultationDto: CreatePatientMedicalConsultationDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const newPatient = await this.patientsService.create(createPatientMedicalConsultationDto.patient);
    if (!newPatient) return rsp404(res);

    const newPatientId = newPatient.id;

    const createAllergyDto = { ...createPatientMedicalConsultationDto.allergy, patient_id: newPatientId };
    const createMedicalHistoryDto = {
      ...createPatientMedicalConsultationDto.medical_history,
      patient_id: newPatientId,
    };

    await this.allergiesService.create(createAllergyDto);
    await this.medicalHistoriesService.create(createMedicalHistoryDto);

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: newPatientId,
      target_row_label: newPatientId.toString(),
      log_target_id: LogTargetsIds.PATIENT,
      data: JSON.stringify(newPatient),
    });

    return rsp201(res, newPatientId);
  }

  @UseFilters(ValidationExceptionFilter)
  @Post('consultation')
  async createConsultation(
    @Body() createConsultationDetailsDto: CreateConsultationDetailsDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const newMedicalConsultation = await this.medicalConsultationsService.create(
      authUser.id,
      createConsultationDetailsDto.medical_consultation,
    );
    if (!newMedicalConsultation) throw new BadRequestException('Este usuario no tiene programacion medica');

    const newMedicalConsultationId = newMedicalConsultation.id;

    const attendanceDetailDto = {
      ...createConsultationDetailsDto.attendance_detail,
      medical_consultation_id: newMedicalConsultationId,
    };
    const medicalDiagnosisDto = {
      ...createConsultationDetailsDto.medical_diagnosis,
      medical_consultation_id: newMedicalConsultationId,
    };

    const medicalPrescriptionDto = createConsultationDetailsDto.prescription.map(prescription => ({
      ...prescription,
      medical_consultation_id: newMedicalConsultationId,
    }));

    await this.attendanceDetailsService.create(attendanceDetailDto);
    await this.medicalDiagnosesService.create(medicalDiagnosisDto);
    await this.prescriptionsService.batchInsert(medicalPrescriptionDto);

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: newMedicalConsultationId,
      target_row_label: newMedicalConsultationId.toString(),
      log_target_id: LogTargetsIds.MEDICAL_CONSULTATION,
      data: JSON.stringify(newMedicalConsultation),
    });

    return rsp201(res, newMedicalConsultationId);
  }

  @Post('emergency-notification')
  async createEmergencyNotification(@Body() createDto: CreateEmergencyNotificationDto, @Res() res: Response) {
    await this.notificationsService.reportEmergency(createDto.user_id);
    rsp201(res, null);
  }

  @UseFilters(ValidationExceptionFilter)
  @Patch('patient/:id')
  async updatePatient(
    @Param() params: ParamIdDto,
    @Body() updatePatientMedicalConsultationDto: UpdatePatientMedicalConsultationDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const patient = await this.patientsService.findOne(params.id);
    if (!patient) return rsp404(res);

    const dataChanged = this.logsService.getDataChangedJson(patient, updatePatientMedicalConsultationDto.patient);

    if (dataChanged) {
      await this.patientsService.update(params.id, updatePatientMedicalConsultationDto.patient);

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: patient.id,
        target_row_label: patient.id.toString(),
        log_target_id: LogTargetsIds.PATIENT,
        data: dataChanged,
      });
    }

    await this.allergiesService.update(patient.allergy.id, updatePatientMedicalConsultationDto.allergy);
    await this.medicalHistoriesService.update(
      patient.medical_history.id,
      updatePatientMedicalConsultationDto.medical_history,
    );

    return rspOkUpdated(res);
  }
}
