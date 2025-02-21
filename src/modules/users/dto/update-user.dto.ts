import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
  MinLength,
  Validate,
  ValidateIf,
} from 'class-validator';
import { DocumentNumberLengthValidator } from 'src/common/validators/document-number.validator';
import { UserPredictablePassword } from 'src/common/validators/password-user-predictable.validator';
import { ClientLevelExists } from 'src/modules/client-levels/decorators/client-level-exists.decorator';
import { ClientLevelIds } from 'src/modules/client-levels/entities/client-level.entity';
import { CostCenterExists } from 'src/modules/cost-centers/decorators/cost-center-exists.decorator';
import { DocumentTypeExists } from 'src/modules/document-types/decorators/document-type-exists.decorator';
import { ProffessionExists } from 'src/modules/proffesions/decorators/proffesion-exists.decorator';
import { RoleExists } from 'src/modules/roles/decorators/role-exists.decorator';
import { RoleIds } from 'src/modules/roles/entities/role.entity';
import { SexExists } from 'src/modules/sexes/decorators/sex-exists.decorator';
import { UbigeoPeruDepartmentExists } from 'src/modules/ubigeo/decorators/department-exists.decorator';
import { UbigeoPeruDistrictExists } from 'src/modules/ubigeo/decorators/district-exists.decorator';
import { UbigeoPeruProvinceExists } from 'src/modules/ubigeo/decorators/province-exists.decorator';
import { CheckUserLegalAge } from '../validators/check-user-legal-age.validator';

export class UpdateUserDto {
  @IsInt()
  @Min(1, { message: 'Perfil es requerido' })
  @Type(() => Number)
  @RoleExists({ message: 'Rol no existe' })
  role_id?: number;

  @IsOptional()
  @IsString({ message: 'Nombre debe ser texto' })
  @Length(3, 50, { message: 'Nombre es requerido (3 a 50 caracteres)' })
  @Matches(/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/, {
    message: 'Nombre es requerido (solo letras y espacios)',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(3, 50, { message: 'Apellido paterno es requerido (3 a 50 caracteres)' })
  @Matches(/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/, {
    message: 'Apellido paterno es requerido (solo letras y espacios)',
  })
  surname_first?: string;

  @IsOptional()
  @IsString()
  @Length(3, 50, { message: 'Apellido materno es requerido (3 a 50 caracteres)' })
  @Matches(/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/, {
    message: 'Apellido materno es requerido (solo letras y espacios)',
  })
  surname_second?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Tipo de documento es requerido' })
  @Type(() => Number)
  @DocumentTypeExists({ message: 'Tipo de documento no existe' })
  document_type_id?: number;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Número de documento requerido' })
  @Validate(DocumentNumberLengthValidator)
  document_number?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email es requerido' })
  email?: string;

  @IsOptional()
  @Matches(/^[0-9]{9}$/, {
    message: 'Celular es requerido (solo 9 caracteres)',
  })
  phone?: string;

  @IsOptional()
  @Matches(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~])[a-zA-Z\d!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]{8,}$/,
    {
      message:
        'Contraseña solo letras y numeros, minimo: 8 caracteres, 1 letra minuscula, 1 letra mayuscula, 1 numero y 1 caracter especial ',
    },
  )
  @Validate(UserPredictablePassword)
  @ValidateIf(o => (o.password ? true : false))
  password?: string;

  @IsOptional()
  @IsIn([0, 1])
  is_central?: number;

  // equipo asistencial requeridos
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Sexo es requerido' })
  @Type(() => Number)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  @SexExists({ message: 'Sexo seleccionado no existe' })
  sex_id?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Ingrese una fecha de nacimiento válida' })
  @Validate(CheckUserLegalAge)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  birthdate?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Profesion es requerido' })
  @Type(() => Number)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  @ProffessionExists({ message: 'Profesión no existe' })
  proffesion_id?: number;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9}$/, {
    message: 'Colegiatura es requerido (solo 9 digitos)',
  })
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  colegiatura?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Departamento es requerido' })
  @Type(() => Number)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  @UbigeoPeruDepartmentExists({ message: 'Departamento no existe' })
  ubigeo_peru_department_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Provincia es requerido' })
  @Type(() => Number)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  @UbigeoPeruProvinceExists({ message: 'Provincia no existe' })
  ubigeo_peru_province_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Distrito es requerido' })
  @Type(() => Number)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  @UbigeoPeruDistrictExists({ message: 'Distrito no existe' })
  ubigeo_peru_district_id?: number;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Direccion es requerido (minimo 3 caracteres)' })
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  address?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Centro de costo es requerido' })
  @Type(() => Number)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  @CostCenterExists({ message: 'Centro de costo no existe' })
  cost_center_id?: number;

  @IsOptional()
  @IsIn([0, 1])
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  can_download?: number;

  // equipo asistencial no requeridos
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Especialidad es requerido (minimo 3 caracteres)' })
  @ValidateIf(o => (o.speciality ? true : false))
  speciality?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Nivel de usuario es requerido' })
  @IsEnum(ClientLevelIds)
  @ClientLevelExists({ message: 'Nivel de cliente no existe' })
  @ValidateIf(o => o.role_id === RoleIds.CLIENT)
  client_level_id?: ClientLevelIds;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'La llave secreta de MFA no puede estar vacia' })
  oauth_secret_key?: string;

  @IsOptional()
  @IsIn([0, 1])
  @Type(() => Number)
  secret_key_approved?: boolean;
}
