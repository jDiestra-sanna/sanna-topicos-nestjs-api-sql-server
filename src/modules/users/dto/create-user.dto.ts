import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsString,
  Length,
  Matches,
  Min,
  MinLength,
  Validate,
  ValidateIf,
} from 'class-validator';
import { RoleIds } from 'src/modules/roles/entities/role.entity';
import { UserUniqueEmailValidator } from '../../../common/validators/unique-user-email.validator';
import { UserPredictablePassword } from 'src/common/validators/password-user-predictable.validator';
import { DocumentNumberLengthValidator } from 'src/common/validators/document-number.validator';
import { RoleExists } from 'src/modules/roles/decorators/role-exists.decorator';
import { DocumentTypeExists } from 'src/modules/document-types/decorators/document-type-exists.decorator';
import { SexExists } from 'src/modules/sexes/decorators/sex-exists.decorator';
import { ProffessionExists } from 'src/modules/proffesions/decorators/proffesion-exists.decorator';
import { UbigeoPeruDepartmentExists } from 'src/modules/ubigeo/decorators/department-exists.decorator';
import { UbigeoPeruProvinceExists } from 'src/modules/ubigeo/decorators/province-exists.decorator';
import { UbigeoPeruDistrictExists } from 'src/modules/ubigeo/decorators/district-exists.decorator';
import { CostCenterExists } from 'src/modules/cost-centers/decorators/cost-center-exists.decorator';
import { UserTypeIds } from '../entities/type-user.entity';
import { CheckUserLegalAge } from '../validators/check-user-legal-age.validator';

export class UserCreationRequestDto {
  @IsInt()
  @Min(1, { message: 'Perfil es requerido' })
  @Type(() => Number)
  @RoleExists({ message: 'Rol no existe' })
  role_id: number;

  @IsString({ message: 'Nombre debe ser texto' })
  @Length(3, 50, { message: 'Nombre es requerido (3 a 50 caracteres)' })
  @Matches(/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/, {
    message: 'Nombre es requerido (solo letras y espacios)',
  })
  name: string;

  @IsString()
  @Length(3, 50, { message: 'Apellido paterno es requerido (3 a 50 caracteres)' })
  @Matches(/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/, {
    message: 'Apellido paterno es requerido (solo letras y espacios)',
  })
  surname_first: string;

  @IsString()
  @Length(3, 50, { message: 'Apellido materno es requerido (3 a 50 caracteres)' })
  @Matches(/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/, {
    message: 'Apellido materno es requerido (solo letras y espacios)',
  })
  surname_second: string;

  @IsInt()
  @Min(1, { message: 'Tipo de documento es requerido' })
  @Type(() => Number)
  @DocumentTypeExists({ message: 'Tipo de documento no existe' })
  document_type_id: number;

  @IsString()
  @MinLength(1, { message: 'Número de documento requerido' })
  @Validate(DocumentNumberLengthValidator)
  document_number: string;

  @IsEmail({}, { message: 'Email es requerido' })
  @Validate(UserUniqueEmailValidator)
  email: string;

  @Matches(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~])[a-zA-Z\d!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]{8,}$/,
    {
      message:
        'Contraseña solo letras y numeros, minimo: 8 caracteres, 1 letra minuscula, 1 letra mayuscula, 1 numero y 1 caracter especial ',
    },
  )
  @Validate(UserPredictablePassword)
  password: string;

  @Matches(/^[0-9]{9}$/, {
    message: 'Celular es requerido (solo 9 caracteres)',
  })
  phone: string;

  @IsIn([0, 1])
  is_central: number;

  // equipo asistencial requeridos
  @IsInt()
  @Min(1, { message: 'Sexo es requerido' })
  @Type(() => Number)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  @SexExists({ message: 'Sexo seleccionado no existe' })
  sex_id: number;

  @IsInt()
  @Min(1, { message: 'Profesion es requerido' })
  @Type(() => Number)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  @ProffessionExists({ message: 'Profesión no existe' })
  proffesion_id: number;

  @IsString()
  @MinLength(3, { message: 'Especialidad es requerido (minimo 3 caracteres)' })
  @ValidateIf(o => (o.speciality ? true : false))
  speciality: string;

  @IsString()
  @Matches(/^[0-9]{9}$/, {
    message: 'Colegiatura es requerido (solo 9 digitos)',
  })
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  colegiatura: string;

  @IsInt()
  @Min(1, { message: 'Departamento es requerido' })
  @Type(() => Number)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  @UbigeoPeruDepartmentExists({ message: 'Departamento no existe' })
  ubigeo_peru_department_id: number;

  @IsInt()
  @Min(1, { message: 'Provincia es requerido' })
  @Type(() => Number)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  @UbigeoPeruProvinceExists({ message: 'Provincia no existe' })
  ubigeo_peru_province_id: number;

  @IsInt()
  @Min(1, { message: 'Distrito es requerido' })
  @Type(() => Number)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  @UbigeoPeruDistrictExists({ message: 'Distrito no existe' })
  ubigeo_peru_district_id: number;

  @IsString()
  @MinLength(3, { message: 'Direccion es requerido (minimo 3 caracteres)' })
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  address: string;

  @IsInt()
  @Min(1, { message: 'Centro de costo es requerido' })
  @Type(() => Number)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  @CostCenterExists({ message: 'Centro de costo no existe' })
  cost_center_id: number;

  @IsDateString({}, { message: 'Ingrese una fecha de nacimiento válida' })
  @Validate(CheckUserLegalAge)
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  birthdate: string;

  @IsIn([0, 1])
  @ValidateIf(o => o.role_id === RoleIds.HEALTH_TEAM)
  can_download: number;
}

export class NewUserDto extends UserCreationRequestDto {
  @IsEnum(UserTypeIds, { message: 'Tipo de usuario no existe' })
  user_type_id: number;
}
