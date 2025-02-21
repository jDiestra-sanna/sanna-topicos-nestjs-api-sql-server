import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  Validate,
  ValidateIf,
} from 'class-validator';
import { isMinor } from 'src/common/helpers/age-calculator';
import { DocumentNumberLengthValidator, DocumentValidator } from 'src/common/validators/document-number.validator';
import { DocumentTypeExists } from 'src/modules/document-types/decorators/document-type-exists.decorator';
import { documentType } from 'src/modules/document-types/entities/document-types.entity';
import { PatientProfileExists } from 'src/modules/patient-profile/decorators/patient-profile-exists.decorator';
import { patientProfile } from 'src/modules/patient-profile/entity/patient-profile.entity';
import { SexExists } from 'src/modules/sexes/decorators/sex-exists.decorator';
import { sex } from 'src/modules/sexes/entities/sex.entity';

export class UpdatePatientDto {
  @IsOptional()
  @IsInt({ message: 'Ingrese un tipo de documento' })
  @IsEnum(documentType, { message: 'Tipo de documento debe ser DNI ó CE' })
  @Validate(DocumentValidator)
  @DocumentTypeExists({ message: 'Tipo de documento no existe' })
  document_type_id?: documentType;

  @IsOptional()
  @IsString({ message: 'Ingrese un número de documento válido' })
  @Validate(DocumentNumberLengthValidator)
  @Matches(/^[0-9]*$/, {
    message: 'Número de documento solo debe contener números',
  })
  document_number?: string;

  @IsOptional()
  @IsString({ message: 'Ingrese un número de documento válido' })
  @Matches(/^[0-9]{9}$/, {
    message: 'Celular solo 9 caracteres',
  })
  contact_number?: string;

  @IsOptional()
  @IsString({ message: 'El apellido paterno debe ser texto' })
  @MinLength(1, { message: 'Ingrese el apellido paterno' })
  surname_first?: string;

  @IsOptional()
  @IsString({ message: 'El apellido materno debe ser texto' })
  @MinLength(1, { message: 'Ingrese el apellido materno' })
  surname_second?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(1, { message: 'Por favor ingrese un nombre' })
  name?: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsOptional()
  @IsInt({ message: 'Ingrese un tipo de sexo' })
  @IsEnum(sex)
  @SexExists({ message: 'Sexo no existe' })
  sex_id?: sex;

  @IsOptional()
  @IsInt({ message: 'Ingrese un tipo de perfil de paciente' })
  @IsEnum(patientProfile)
  @PatientProfileExists({ message: 'Perfil de paciente no existe' })
  patient_profile_id?: patientProfile;

  @ValidateIf(o => o.patient_profile_id === patientProfile.OTHER)
  @IsString({ message: 'Ingrese otro perfil de paciente' })
  other_profile: string;

  @ValidateIf(o => isMinor(o.birthdate))
  @MinLength(1, { message: 'Ingrese los nombres del apoderado' })
  @IsString({ message: 'Nombres de apoderado deben ser texto' })
  minor_attorney_names: string;

  @ValidateIf(o => isMinor(o.birthdate))
  @MinLength(1, { message: 'Ingrese los apellidos del apoderado' })
  @IsString({ message: 'Apellidos de apoderado deben ser texto' })
  minor_attorney_surnames: string;

  @ValidateIf(o => isMinor(o.birthdate))
  @MinLength(1, { message: 'Ingrese el número de contacto del apoderado' })
  @IsString({ message: 'Número de contacto de apoderado debe ser texto' })
  @Matches(/^[0-9]{9}$/, {
    message: 'Celular de apoderado solo 9 caracteres',
  })
  minor_attorney_contact_number: string;
}
