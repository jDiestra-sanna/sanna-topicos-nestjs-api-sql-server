import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecordsController } from './attendance-records.controller';
import { AttendanceRecordsService } from './attendance-records.service';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { LogsModule } from '../logs/logs.module';
import { MedicalCalendarsModule } from '../medical-calendars/medical-calendars.module';
import { MedicalCalendar } from '../medical-calendars/entities/medical-calendar.entity';
import { MedicalCalendarDay } from '../medical-calendars/entities/medical-calendar-days.entity';
import { SessionsModule } from '../sessions/sessions.module';
import { CampusModule } from '../campus/campus.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecord, MedicalCalendar, MedicalCalendarDay]),
    LogsModule,
    MedicalCalendarsModule,
    SessionsModule,
    CampusModule
  ],
  controllers: [AttendanceRecordsController],
  providers: [AttendanceRecordsService],
  exports: [AttendanceRecordsService],
})
export class AttendanceRecordsModule {}
