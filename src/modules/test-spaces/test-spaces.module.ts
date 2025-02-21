import { AttendanceRecordsModule } from '../attendance-records/attendance-records.module';
import { FakerModule } from 'src/faker/faker.module';
import { MedicalCalendarsModule } from '../medical-calendars/medical-calendars.module';
import { Module } from '@nestjs/common';
import { TestSpacesController } from './test-spaces.controller';

@Module({
  imports: [MedicalCalendarsModule, AttendanceRecordsModule, FakerModule],
  controllers: [TestSpacesController],
  providers: [],
  exports: [],
})
export class TestSpacesModule {}
