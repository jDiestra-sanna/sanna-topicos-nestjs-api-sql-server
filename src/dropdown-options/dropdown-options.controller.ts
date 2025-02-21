import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { paginatedRspOk, rspOk } from 'src/common/helpers/http-responses';
import { CampusService } from 'src/modules/campus/campus.service';
import { ClientsService } from 'src/modules/clients/clients.service';
import { ReqQuery as ReqQueryCampus } from 'src/modules/campus/dto/req-query.dto';
import { ReqQuery as ReqQueryClient } from 'src/modules/clients/dto/req-query.dto';
import { ReqQuery as ReqQueryGroup } from 'src/modules/groups/dto/req-query.dto';
import { GroupsService } from 'src/modules/groups/groups.service';
import { ReqQueryDepartment } from 'src/modules/ubigeo/dto/req-query-department.dto';
import { UbigeoPeruDepartmentsService } from 'src/modules/ubigeo/departments.service';
import { UbigeoPeruProvincesService } from 'src/modules/ubigeo/provinces.service';
import { UbigeoPeruDistrictsService } from 'src/modules/ubigeo/districts.service';
import { ReqQueryProvince } from 'src/modules/ubigeo/dto/req-query-province.dto';
import { ReqQueryDistrict } from 'src/modules/ubigeo/dto/req-query-district.dto';
import { RolesService } from 'src/modules/roles/roles.service';
import { ReqQuery as ReqQueryRole } from 'src/modules/roles/dto/req-query.dto';
import { ReqQuery as ReqQueryDocumentType } from 'src/modules/document-types/dto/req-query.dto';
import { DocumentTypesService } from 'src/modules/document-types/document-type.service';
import { SexesService } from 'src/modules/sexes/sexes.service';
import { ProffesionsService } from 'src/modules/proffesions/proffesions.service';
import { ReqQuery as ReqQuerySex } from 'src/modules/sexes/dto/req-query.dto';
import { ReqQuery as ReqQueryProffesion } from 'src/modules/proffesions/dto/req-query.dto';
import { ReqQuery as ReqQueryCostCenter } from 'src/modules/cost-centers/dto/req-query.dto';
import { CostCentersService } from 'src/modules/cost-centers/cost-centers.service';
import { ReqQuery as ReqQueryFileType } from 'src/modules/file-types/dto/req-query.dto';
import { ReqQuery as ReqQueryDiagnosisType } from 'src/modules/diagnoses/dto/req-query-diagnosis-type.dto';
import { FileTypesService } from 'src/modules/file-types/file-types.service';
import { ReqQuery as ReqQueryArticleGroups } from 'src/modules/article-groups/dto/req-query.dto';
import { ReqQuery as ReqQueryFormFactors } from 'src/modules/form-factor/dto/req-query.dto';
import { ArticleGroupsService } from 'src/modules/article-groups/article-groups.service';
import { FormFactorsService } from 'src/modules/form-factor/form-factor.service';
import { DiagnosisTypesService } from 'src/modules/diagnoses/diagnosesType.service';
import { ProtocolTypesService } from 'src/modules/protocols/protocol-types.service';
import { ReqQuery as ReqQueryProtocolType } from 'src/modules/protocols/dto/req-query-protocol-type.dto';
import { ReqQuery as ReqQueryPatientProfile } from 'src/modules/patient-profile/dto/req-query';
import { PatientProfilesService } from 'src/modules/patient-profile/patient-profiles.service';
import { ReqQuery as ReqQueryConsultationType } from 'src/modules/consultation-types/dto/req-query';
import { ConsultationTypesService } from 'src/modules/consultation-types/consultation-types.service';
import { ReqQuery as ReqQueryIllnessQuantityType } from 'src/modules/illness-quantity-types/dto/req-query';
import { IllnessQuantityTypesService } from 'src/modules/illness-quantity-types/illness-quantity-types.service';
import { ReqQuery as ReqQueryBiologicalSystems } from 'src/modules/biological-systems/dto/req-query';
import { BiologicalSystemsService } from 'src/modules/biological-systems/biological-systems.service';
import { ReqQuery as ReqQueryAttendancePlace } from 'src/modules/attendance-places/dto/req-query.dto';
import { AttendancePlacesService } from 'src/modules/attendance-places/attendance-places.service';
import { ReqQuery as ReqQueryDiagnoses } from 'src/modules/diagnoses/dto/req-query.dto';
import { ReqQuery as ReqQueryMedicines } from 'src/modules/medicines/dto/req-query.dto';
import { MedicineService } from 'src/modules/medicines/medicines.service';
import { DiagnosesService } from 'src/modules/diagnoses/diagnoses.service';
import { ReqQuery as ReqQueryAssignmentsByClient } from 'src/modules/consultation-history/dto/req-query-clients-by-user.dto';
import { ConsultationHistoriesService } from 'src/modules/consultation-history/consultation-history.service';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { RoleIds } from 'src/modules/roles/entities/role.entity';
import { PatientsService } from 'src/modules/medical-consultations/patients/patients.service';
import { ReqQuery as ReqQueryPatient } from 'src/modules/medical-consultations/patients/dto/req-query';
import { ReqQueryFindAllUserAssigmentsClients } from 'src/modules/consultation-history/dto/req-query-user-assignments-clients.dto';
import { ReqQueryFindAllUserAssigmentsCampus } from 'src/modules/consultation-history/dto/req-query-user-assignments-campus.dto';
import { ReqQuery as ReqQueryClientLevel } from 'src/modules/client-levels/dto/req-query.dto';
import { ClientLevelsService } from 'src/modules/client-levels/client-levels.service';
import { MedicalCalendarsService } from 'src/modules/medical-calendars/medical-calendars.service';
import { ReqQueryCampusList } from 'src/modules/medical-calendars/dto/req-query-programmed-campuses.dto';
import { name } from 'ejs';

@Controller('dropdown-options')
export class DropdownOptionsController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly groupsService: GroupsService,
    private readonly clientService: ClientsService,
    private readonly campusService: CampusService,
    private readonly fileTypesService: FileTypesService,
    private readonly documentTypesService: DocumentTypesService,
    private readonly sexesService: SexesService,
    private readonly proffesionsService: ProffesionsService,
    private readonly costCentersService: CostCentersService,
    private readonly ubigeoPeruDepartmentsService: UbigeoPeruDepartmentsService,
    private readonly ubigeoPeruProvincesService: UbigeoPeruProvincesService,
    private readonly ubigeoPeruDistrictsService: UbigeoPeruDistrictsService,
    private readonly articleGroupsService: ArticleGroupsService,
    private readonly formFactorsService: FormFactorsService,
    private readonly diagnosisTypesService: DiagnosisTypesService,
    private readonly protocolTypesService: ProtocolTypesService,
    private readonly patientProfilesService: PatientProfilesService,
    private readonly consultationTypesService: ConsultationTypesService,
    private readonly illnessQuantityTypesService: IllnessQuantityTypesService,
    private readonly biologicalSystemsService: BiologicalSystemsService,
    private readonly attendancePlacesService: AttendancePlacesService,
    private readonly diagnosesService: DiagnosesService,
    private readonly medicinesService: MedicineService,
    private readonly consultationHistoriesService: ConsultationHistoriesService,
    private readonly patientsService: PatientsService,
    private readonly clientLevelsService: ClientLevelsService,
    private readonly medicalCalendarsService: MedicalCalendarsService,
  ) {}

  @Get('groups')
  async getGroups(@Query() query: ReqQueryGroup, @Res() res: Response) {
    const result = await this.groupsService.findAll(query);

    let items = result.items.map(item => {
      return {
        id: item.id,
        name: item.name,
        state: item.state,
      };
    });

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('clients')
  async getClients(@Query() query: ReqQueryClient, @Res() res: Response) {
    const result = await this.clientService.findAll(query);

    let items = result.items.map(item => {
      return {
        id: item.id,
        name: item.name,
        state: item.state,
        group: item.group
          ? {
              id: item.group.id,
              name: item.group.name,
            }
          : null,
      };
    });

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('campus')
  async getCampus(@Query() query: ReqQueryCampus, @Res() res: Response) {
    const result = await this.campusService.findAll(query);

    let items = result.items.map(item => {
      return {
        id: item.id,
        name: item.name,
        state: item.state,
        client: item.client
          ? {
              id: item.client.id,
              name: item.client.name,
              group: item.client.group
                ? {
                    id: item.client.group.id,
                    name: item.client.group.name,
                  }
                : null,
            }
          : null,
      };
    });

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('ubigeo-peru-departments')
  async getUbigeoPeruDepartments(@Query() query: ReqQueryDepartment, @Res() res: Response) {
    const result = await this.ubigeoPeruDepartmentsService.findAll(query);
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }

  @Get('ubigeo-peru-provinces')
  async getUbigeoPeruProvinces(@Query() query: ReqQueryProvince, @Res() res: Response) {
    const result = await this.ubigeoPeruProvincesService.findAll(query);
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }

  @Get('ubigeo-peru-districts')
  async getUbigeoPeruDistricts(@Query() query: ReqQueryDistrict, @Res() res: Response) {
    const result = await this.ubigeoPeruDistrictsService.findAll(query);
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }

  @Get('roles')
  async getRoles(@Query() query: ReqQueryRole, @Res() res: Response) {
    const result = await this.rolesService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('document-types')
  async getDocumentTypes(@Query() query: ReqQueryDocumentType, @Res() res: Response) {
    const result = await this.documentTypesService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('sexes')
  async getSexes(@Query() query: ReqQuerySex, @Res() res: Response) {
    const result = await this.sexesService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('proffesions')
  async getProffesions(@Query() query: ReqQueryProffesion, @Res() res: Response) {
    const result = await this.proffesionsService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('cost-centers')
  async getCostCenters(@Query() query: ReqQueryCostCenter, @Res() res: Response) {
    const result = await this.costCentersService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('file-types')
  async getFileTypes(@Query() query: ReqQueryFileType, @Res() res: Response) {
    const result = await this.fileTypesService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('article-groups')
  async getArticleGroups(@Query() query: ReqQueryArticleGroups, @Res() res: Response) {
    const result = await this.articleGroupsService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('form-factors')
  async getFormFactors(@Query() query: ReqQueryFormFactors, @Res() res: Response) {
    const result = await this.formFactorsService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('diagnosis-types')
  async getDiagnosisTypes(@Query() query: ReqQueryDiagnosisType, @Res() res: Response) {
    const result = await this.diagnosisTypesService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('patient-profiles')
  async getPatientProfiles(@Query() query: ReqQueryPatientProfile, @Res() res: Response) {
    const result = await this.patientProfilesService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('consultation-types')
  async getConsultationTypes(@Query() query: ReqQueryConsultationType, @Res() res: Response) {
    const result = await this.consultationTypesService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('illness-quantity-types')
  async getIllnessQuantityTypes(@Query() query: ReqQueryIllnessQuantityType, @Res() res: Response) {
    const result = await this.illnessQuantityTypesService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }
  @Get('biological-systems')
  async getBiologicalSystems(@Query() query: ReqQueryBiologicalSystems, @Res() res: Response) {
    const result = await this.biologicalSystemsService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('attendance-places')
  async getAttendancePlaces(@Query() query: ReqQueryAttendancePlace, @Res() res: Response) {
    const result = await this.attendancePlacesService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('diagnoses')
  async getDiagnoses(@Query() query: ReqQueryDiagnoses, @Res() res: Response) {
    const result = await this.diagnosesService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
      code: item.code,
      state: item.state,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('medicines')
  async getMedicines(@Query() query: ReqQueryMedicines, @Res() res: Response) {
    const result = await this.medicinesService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
      state: item.state,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('protocol-types')
  async getProtocolTypes(@Query() query: ReqQueryProtocolType, @Res() res: Response) {
    const result = await this.protocolTypesService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('patients')
  async getPatients(@Query() query: ReqQueryPatient, @Res() res: Response) {
    const result = await this.patientsService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
      surname_first: item.surname_first,
      surname_second: item.surname_second,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('userclient-assignments')
  async getClientsByUser(
    @Query() query: ReqQueryAssignmentsByClient,
    @AuthUser() authUser: User,
    @Res() res: Response,
  ) {
    const items = await this.consultationHistoriesService.findAllAsignmentsByClientPaginated(authUser.id, query);
    return paginatedRspOk(res, items.items, items.total, items.limit, items.page);
  }

  @Get('users/:userId/assignments/clients')
  async getUserAssignmentsClients(
    @Query() query: ReqQueryFindAllUserAssigmentsClients,
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
    @Res() res: Response,
  ) {
    const items = await this.consultationHistoriesService.findAllUserAssigmentsClients(userId, query);
    return paginatedRspOk(res, items.items, items.total, items.limit, items.page);
  }

  @Get('users/:userId/assignments/campus')
  async getUserAssignmentsCampus(
    @Query() query: ReqQueryFindAllUserAssigmentsCampus,
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
    @Res() res: Response,
  ) {
    const items = await this.consultationHistoriesService.findAllUserAssigmentsCampus(userId, query);
    return paginatedRspOk(res, items.items, items.total, items.limit, items.page);
  }

  @Get('client-levels')
  async getClientLevels(@Query() query: ReqQueryClientLevel, @Res() res: Response) {
    const result = await this.clientLevelsService.findAll(query);

    let items = result.items.map(item => ({
      id: item.id,
      name: item.name,
    }));

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }

  @Get('scheduled-campuses')
  async getProgrammedCampuses(@Query() query: ReqQueryCampusList, @Res() res: Response) {
    const result = await this.medicalCalendarsService.scheduledCampusesPaginated(query);

    const items = result.items.map(item => item.campus)

    return paginatedRspOk(res, items, result.total, result.limit, result.page);
  }
}
