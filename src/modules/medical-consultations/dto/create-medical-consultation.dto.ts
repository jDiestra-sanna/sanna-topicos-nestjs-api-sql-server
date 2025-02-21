import { IsDateString, IsInt, Matches } from 'class-validator';
import { PatientExists } from '../patients/validators/patient.validator';
import { CampusExists } from 'src/modules/campus/decorators/campus-exists.decorator';

export class CreateMedicalConsultationDto {
  @IsDateString({}, { message: 'Por favor ingrese una fecha' })
  attendance_date: Date;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Por favor ingrese una hora válida en formato HH:MM' })
  attendance_time: string;

  @IsInt({ message: 'Por favor ingrese un ID de paciente' })
  @PatientExists({ message: 'Paciente no existe' })
  patient_id: number;

  @IsInt({ message: 'Campus debe ser un número entero' })
  @CampusExists({ message: 'Campus no existe' })
  campus_id: number;
}
