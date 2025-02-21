import { Module } from '@nestjs/common';
import { LogsModule } from '../logs/logs.module';
import { MedicalCalendarsController } from './medical-calendars.controller';
import { MedicalCalendarsService } from './medical-calendars.service';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalCalendar } from './entities/medical-calendar.entity';
import { MedicalCalendarDay } from './entities/medical-calendar-days.entity';
import { CampusModule } from '../campus/campus.module';
import { CampusIsEnabledRule } from './validators/campus.validator';
import ExcelJSService from 'src/exceljs/exceljs.service';
import { MedicalCalendarExistsRule } from './decorators/medical-calendar-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalCalendar, MedicalCalendarDay]), LogsModule, UsersModule, CampusModule],
  controllers: [MedicalCalendarsController],
  exports: [MedicalCalendarsService, TypeOrmModule],
  providers: [MedicalCalendarsService, CampusIsEnabledRule, ExcelJSService, MedicalCalendarExistsRule],
  
})
export class MedicalCalendarsModule {}
