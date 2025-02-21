import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseFindAllRequestQuery } from 'src/common/dto/url-query.dto';
import { DocumentTypeExists } from 'src/modules/document-types/decorators/document-type-exists.decorator';
import { documentType } from 'src/modules/document-types/entities/document-types.entity';
import { PatientProfileExists } from 'src/modules/patient-profile/decorators/patient-profile-exists.decorator';
import { patientProfile } from 'src/modules/patient-profile/entity/patient-profile.entity';
import { SexExists } from 'src/modules/sexes/decorators/sex-exists.decorator';
import { sex } from 'src/modules/sexes/entities/sex.entity';

export enum OrderCol {
  ID = 'patients.id',
  DOCUMENT_NUMBER = 'patients.document_number',
  SURNAME_FIRST = 'patients.surname_first',
  SURNAME_SECOND = 'patients.second',
  NAME = 'patients.name',
  BIRTH_DATE = 'patients.birth_date',
  DOCUMENT_TYPE_NAME = 'document_types.name',
  SEXES_NAME = 'sexes.name',
  PATIENT_PROFILE_NAME = 'patient_profiles.name',
  STATE = 'patients.state',
  DATE_CREATED = 'patients.date_created',
}

export class ReqQuery extends BaseFindAllRequestQuery {
  @IsOptional()
  @IsEnum(OrderCol)
  order_col: OrderCol = OrderCol.ID;

  @IsOptional()
  @IsInt()
  @DocumentTypeExists({ message: 'Tipo de documento no existe' })
  @IsEnum(documentType)
  document_type_id?: documentType;

  @IsOptional()
  @IsInt()
  @SexExists({ message: 'Sexo no existe' })
  @IsEnum(sex)
  sex_id?: sex;

  @IsOptional()
  @IsInt()
  @PatientProfileExists({ message: 'Perfil de paciente no existe' })
  @IsEnum(patientProfile)
  patient_profile_id?: patientProfile;
}
