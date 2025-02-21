import { Module } from '@nestjs/common';
import { AttendanceRecordsModule } from '../attendance-records/attendance-records.module';
import { MedicalCalendarsModule } from '../medical-calendars/medical-calendars.module';
import { HealthTeamProfilesController } from './health-team-profiles.controller';
import { HealthTeamProfilesService } from './health-team-profiles.service';
import { FileTypeModule } from '../file-types/file-types.module';
import { UsersModule } from '../users/users.module';
import { CampusConditionsModule } from '../campus-conditions/campus-conditions.module';

@Module({
  imports: [AttendanceRecordsModule, MedicalCalendarsModule, FileTypeModule, UsersModule, CampusConditionsModule],
  controllers: [HealthTeamProfilesController],
  providers: [HealthTeamProfilesService],
  exports: [HealthTeamProfilesService],
})
export class HealthTeamProfilesModule {}
