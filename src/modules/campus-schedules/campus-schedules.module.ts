import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampusSchedule } from './entities/campus-schedule.entity';
import CampusSchedulesService from './campus-schedules.service';
import { CampusSchedulesController } from './campus-schedules.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CampusSchedule])],
  controllers: [CampusSchedulesController],
  providers: [CampusSchedulesService],
  exports: [CampusSchedulesService],
})
export class CampusSchedulesModule {}
