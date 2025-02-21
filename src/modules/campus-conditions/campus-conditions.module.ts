import { Module } from '@nestjs/common';
import { CampusConditionsService } from './campus-conditions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampusCondition } from './entities/campus-condition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CampusCondition])],
  controllers: [],
  providers: [CampusConditionsService],
  exports: [CampusConditionsService],
})
export class CampusConditionsModule {}
