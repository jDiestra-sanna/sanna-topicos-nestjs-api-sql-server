import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateCampusScheduleDto } from 'src/modules/campus-schedules/dto/create-campus-schedule.dto';
import { ClientExists } from 'src/modules/clients/decorators/client-exists.decorator';
import { UbigeoPeruDepartmentExists } from 'src/modules/ubigeo/decorators/department-exists.decorator';
import { UbigeoPeruDistrictExists } from 'src/modules/ubigeo/decorators/district-exists.decorator';
import { UbigeoPeruProvinceExists } from 'src/modules/ubigeo/decorators/province-exists.decorator';

export class CreateCampusDto {
  @IsInt()
  @Min(1, { message: 'Cliente es requerido' })
  @ClientExists({ message: 'Cliente no existe' })
  @Type(() => Number)
  client_id: number;

  @IsString()
  @MinLength(3, { message: 'Nombre minimo 3 caracteres' })
  name: string;

  @IsDateString({}, { message: 'Fecha de apertura es requerido' })
  opening_date: Date;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7, { message: 'Maximo 7 horarios' })
  @ValidateNested({ each: true })
  @Type(() => CreateCampusScheduleDto)
  schedules?: CreateCampusScheduleDto[];

  @IsInt()
  @Min(1, { message: 'Departamento es requerido' })
  @UbigeoPeruDepartmentExists({ message: 'Departamento no existe' })
  @Type(() => Number)
  ubigeo_peru_department_id: number;

  @IsInt()
  @Min(1, { message: 'Provincia es requerido' })
  @UbigeoPeruProvinceExists({ message: 'Provincia no existe' })
  @Type(() => Number)
  ubigeo_peru_province_id: number;

  @IsInt()
  @Min(1, { message: 'Distrito es requerido' })
  @UbigeoPeruDistrictExists({ message: 'Distrito no existe' })
  @Type(() => Number)
  ubigeo_peru_district_id: number;

  @IsString()
  @MinLength(3, { message: 'Direccion es requerido' })
  address: string;

  @IsOptional()
  @IsString()
  contact: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9}$/, {
    message: 'Celular es requerido (solo 9 caracteres)',
  })
  @ValidateIf(o => (o.phone ? true : false))
  phone: string;

  @IsString()
  @ValidateIf(o => o.email.length > 0)
  @IsEmail({}, { message: 'Correo deberia ser un email valido' })
  email: string;

  @IsOptional()
  @IsString()
  pic: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{4}$/, {
    message: 'Codigo de Almacen deberia de tener 4 digitos',
  })
  @ValidateIf(o => (o.warehouse_code ? true : false))
  warehouse_code: string;
}
