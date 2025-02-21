import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from './entities/medicines.entity';
import { FormFactor } from '../form-factor/entities/form-factor.entity';
import { ArticleGroups } from '../article-groups/entities/article-groups.entity';
import { MedicineController } from './medicines.controller';
import { MedicineService } from './medicines.service';
import { FormFactorExistsRule } from './validators/medicines-form-factor.validator';
import { ArticleGroupExistsRule } from './validators/medicines-article-group.validator';
import { ArticleGroupsService } from '../article-groups/article-groups.service';
import { FormFactorsService } from '../form-factor/form-factor.service';
import { MedicineExistsByCodeRule } from './validators/medicines-code.validator';
import { LogsModule } from '../logs/logs.module';
import { Prescription } from '../medical-consultations/prescriptions/entities/prescription.entity';
import { MedicineExistsRule } from './decorators/medicine-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, FormFactor, ArticleGroups, Prescription]), LogsModule],
  controllers: [MedicineController],
  providers: [
    MedicineService,
    ArticleGroupsService,
    ArticleGroupExistsRule,
    FormFactorsService,
    FormFactorExistsRule,
    MedicineExistsByCodeRule,
    MedicineExistsRule
  ],
  exports: [MedicineService, TypeOrmModule],
})
export class MedicineModule {}
