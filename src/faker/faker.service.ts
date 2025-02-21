import { AllergiesService } from 'src/modules/medical-consultations/allergies/allergies.service';
import { AttendanceDetailsService } from 'src/modules/medical-consultations/attendance-details/attendance-details.service';
import { CampusService } from 'src/modules/campus/campus.service';
import { ClientsService } from 'src/modules/clients/clients.service';
import { consultationType } from 'src/modules/consultation-types/entities/consultation-type.entity';
import { DateTime } from 'luxon';
import { documentType } from 'src/modules/document-types/entities/document-types.entity';
import { faker } from '@faker-js/faker';
import { GroupsService } from 'src/modules/groups/groups.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MedicalConsultationsService } from 'src/modules/medical-consultations/medical-consultations.service';
import { MedicalDiagnosesService } from 'src/modules/medical-consultations/medical-diagnoses/medical-diagnoses.service';
import { MedicalHistoriesService } from 'src/modules/medical-consultations/medical-histories/medical-histories.service';
import { PatientsService } from 'src/modules/medical-consultations/patients/patients.service';
import { PrescriptionsService } from 'src/modules/medical-consultations/prescriptions/prescriptions.service';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class FakerService {
  constructor(
    private readonly allergiesService: AllergiesService,
    private readonly attendanceDetailsService: AttendanceDetailsService,
    private readonly campusService: CampusService,
    private readonly clientsService: ClientsService,
    private readonly groupsService: GroupsService,
    private readonly medicalConsultationsService: MedicalConsultationsService,
    private readonly medicalDiagnosesService: MedicalDiagnosesService,
    private readonly medicalHistoriesService: MedicalHistoriesService,
    private readonly patientsService: PatientsService,
    private readonly prescriptionsService: PrescriptionsService,
    private readonly usersServices: UsersService,
  ) {}

  async fillGroups(length: number = 10) {
    const array = new Array(length).fill(true);
    array.forEach(async () => {
      await this.groupsService.create({
        name: faker.company.name(),
        contact: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        pic: '',
      });
    });
  }

  async fillClients(length: number = 10) {
    const array = new Array(length).fill(true);
    array.forEach(async () => {
      await this.clientsService.create({
        name: faker.company.name(),
        contact: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        pic: '',
        group_id: [3, 4, 5, 7, 8, 10, 11, null][Math.floor(Math.random() * 8) + 1],
      });
    });
  }

  // async fillCampus(length: number = 10) {
  //   const array = new Array(length).fill(true);
  //   array.forEach(async () => {
  //     await this.campusService.create({
  //       name: faker.company.name(),
  //       contact: faker.person.fullName(),
  //       email: faker.internet.email(),
  //       phone: faker.phone.number(),
  //       pic: '',
  //       client_id: [1, 2, 3, 4, 8, 13, 14][Math.floor(Math.random() * 7) + 1],
  //       ubigeo_peru_department_id: 1,
  //       ubigeo_peru_province_id: 101,
  //       ubigeo_peru_district_id: 10101,
  //       address: faker.lorem.words(),
  //       warehouse_code: '1234',
  //       opening_date: '2024-06-13',
  //       opening_hours: faker.lorem.word(),
  //     });
  //   });
  // }

  async fillUsers(length: number = 10) {
    const array = new Array(length).fill(true);
    array.forEach(async () => {
      const role_id = faker.number.int({ min: 4, max: 5 });

      let data: any = {
        user_type_id: 1,
        name: faker.person.firstName(),
        surname_second: faker.person.lastName(),
        surname_first: faker.person.middleName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        password: 'Ko141512',
        document_type_id: faker.number.int({ min: 1, max: 2 }),
        document_number: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
        is_central: 0,
        role_id,
      };

      if (role_id === 5) {
        data = {
          ...data,
          ubigeo_peru_department_id: 1,
          ubigeo_peru_province_id: 101,
          ubigeo_peru_district_id: 10101,
          address: faker.lorem.words(),
          birthdate: '1995-06-13',
          can_download: faker.datatype.boolean() ? 1 : 0,
          colegiatura: faker.number.int({ min: 100000000, max: 999999999 }).toString(),
          cost_center_id: faker.number.int({ min: 1, max: 3 }),
          proffesion_id: faker.number.int({ min: 1, max: 2 }),
          sex_id: faker.number.int({ min: 1, max: 2 }),
          speciality: faker.lorem.word(),
        };
      }

      await this.usersServices.create(data);
    });
  }
/*
  async fillMedicalConsultations(length: number = 10) {
    const array = new Array(length).fill(true);

    for (let index = 0; index < array.length; index++) {
      const document_type_id = faker.number.int({ min: 1, max: 2 });

      const patient = {
        document_type_id,
        document_number:
          document_type_id === documentType.DNI
            ? faker.number.int({ min: 10000000, max: 99999999 }).toString()
            : faker.number.int({ min: 100000000000, max: 999999999999 }).toString(),
        contact_number: faker.number.int({ min: 100000000, max: 999999999 }).toString(),
        surname_first: faker.person.middleName(),
        surname_second: faker.person.lastName(),
        name: faker.person.firstName(),
        birthdate: DateTime.fromJSDate(
          faker.date.between({ from: '1975-01-01T00:00:00.000Z', to: '2000-12-31T00:00:00.000Z' }),
          { zone: 'utc' },
        ).toFormat('yyyy-MM-dd'),
        sex_id: faker.number.int({ min: 1, max: 2 }),
        patient_profile_id: faker.number.int({ min: 1, max: 2 }),
        other_profile: '',
        minor_attorney_names: '',
        minor_attorney_surnames: '',
        minor_attorney_contact_number: '',
      };

      const newPatient = await this.patientsService.create(patient);
      if (!newPatient) throw new InternalServerErrorException('Error al crear paciente');

      const allergy = {
        food_allergy: faker.lorem.words(),
        drug_allergy: faker.lorem.words(),
        patient_id: newPatient.id,
      };

      const medical_history = {
        surgical_history: faker.lorem.words(),
        hypertension: faker.datatype.boolean(),
        asthma: faker.datatype.boolean(),
        cancer: faker.datatype.boolean(),
        epilepsy: faker.datatype.boolean(),
        diabetes: faker.datatype.boolean(),
        psychological_condition: false,
        observation: '',
        others: false,
        others_description: '',
        patient_id: newPatient.id,
      };

      await this.allergiesService.create(allergy);
      await this.medicalHistoriesService.create(medical_history);

      const medical_consultation = {
        // attendance_date: faker.date.between({ from: '2024-01-01T00:00:00.000Z', to: '2024-07-07T00:00:00.000Z' }),
        // attendance_time: `${faker.number.int({ min: 0, max: 23 }).toString().padStart(2, '0')}:${faker.number.int({ min: 0, max: 59 }).toString().padStart(2, '0')}`,
        attendance_date: new Date(2024, 6, 9),
        attendance_time: `${faker.number.int({ min: 0, max: 9 }).toString().padStart(2, '0')}:${faker.number.int({ min: 0, max: 40 }).toString().padStart(2, '0')}`,
        patient_id: newPatient.id,
      };

      const newMedicalConsultation = await this.medicalConsultationsService.create(2, medical_consultation);
      if (!newMedicalConsultation) throw new InternalServerErrorException('Este usuario no tiene programacion medica');

      const consultation_type_id = faker.number.int({ min: 1, max: 2 });

      const attendance_detail = {
        consultation_type_id,
        attendance_place_id: faker.number.int({ min: 1, max: 2 }),
        clinic_derived: consultation_type_id === consultationType.EMERGENCY ? faker.datatype.boolean() : false,
        anamnesis: faker.lorem.words(),
        physical_exam: faker.lorem.words(),
        illness_quantity: faker.number.int({ min: 1, max: 15 }),
        illness_quantity_type_id: faker.number.int({ min: 1, max: 5 }),
        heart_rate: faker.number.int({ min: 40, max: 150 }),
        respiratory_rate: faker.number.int({ min: 10, max: 30 }),
        temperature: faker.number.int({ min: 10, max: 30 }),
        pa: `${faker.number.int({ min: 100, max: 150 })}/${faker.number.int({ min: 10, max: 30 })}`,
        oxygen_saturation: faker.number.int({ min: 10, max: 30 }),
        medical_consultation_id: newMedicalConsultation.id,
      };

      const main_diagnosis_id = faker.number.int({ min: 1, max: 819 });

      const medical_diagnosis = {
        main_diagnosis_id,
        secondary_diagnosis_id: main_diagnosis_id,
        biological_system_id: faker.number.int({ min: 1, max: 10 }),
        involves_mental_health: faker.datatype.boolean(),
        issued_medical_rest: false,
        medical_rest_start: null,
        medical_rest_end: null,
        medical_consultation_id: newMedicalConsultation.id,
      };

      const prescription = [
        {
          medicine_id: faker.number.int({ min: 1, max: 1911 }),
          workplan: faker.lorem.words(),
          observation: '',
          medical_consultation_id: newMedicalConsultation.id,
        },
      ];

      await this.attendanceDetailsService.create(attendance_detail);
      await this.medicalDiagnosesService.create(medical_diagnosis);
      await this.prescriptionsService.batchInsert(prescription);
    }
  }*/
}
