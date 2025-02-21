import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostCenter } from './entities/cost-center.entity';
import { CostCentersController } from './cost-centers.controller';
import { CostCentersService } from './cost-centers.service';
import { CostCenterExistsRule } from './decorators/cost-center-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([CostCenter])],
  controllers: [CostCentersController],
  providers: [CostCentersService, CostCenterExistsRule],
  exports: [CostCentersService],
})
export class CostCenterModule {}
