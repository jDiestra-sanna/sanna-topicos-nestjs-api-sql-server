import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UbigeoPeruDeparment } from './entities/departments.entity';
import { UbigeoPeruProvince } from './entities/province.entity';
import { UbigeoPeruDistrict } from './entities/district.entity';
import { UbigeoPeruDepartmentsService } from './departments.service';
import { UbigeoPeruDistrictsService } from './districts.service';
import { UbigeoPeruProvincesService } from './provinces.service';
import { UbigeoPeruDepartmentsController } from './departments.controllers';
import { UbigeoPeruProvincesController } from './provinces.controllers';
import { UbigeoPeruDistrictsController } from './districts.controllers';
import { UbigeoPeruDepartmentExistsRule } from './decorators/department-exists.decorator';
import { UbigeoPeruProvinceExistsRule } from './decorators/province-exists.decorator';
import { UbigeoPeruDistrictExistsRule } from './decorators/district-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([UbigeoPeruDeparment, UbigeoPeruProvince, UbigeoPeruDistrict])],
  controllers: [UbigeoPeruDepartmentsController, UbigeoPeruProvincesController, UbigeoPeruDistrictsController],
  providers: [
    UbigeoPeruDepartmentsService,
    UbigeoPeruDistrictsService,
    UbigeoPeruProvincesService,
    UbigeoPeruDepartmentExistsRule,
    UbigeoPeruProvinceExistsRule,
    UbigeoPeruDistrictExistsRule,
  ],
  exports: [UbigeoPeruDepartmentsService, UbigeoPeruDistrictsService, UbigeoPeruProvincesService],
})
export class UbigeoModule {}
