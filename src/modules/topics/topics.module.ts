import { Module } from '@nestjs/common';
import { TopicManagementsController } from './topic-managments.controller';
import { TopicsService } from './topics.service';
import { UsersModule } from '../users/users.module';
import { SettingsModule } from '../settings/settings.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalCalendar } from '../medical-calendars/entities/medical-calendar.entity';
import { MedicalCalendarDay } from '../medical-calendars/entities/medical-calendar-days.entity';
import { AttendanceRecord } from '../attendance-records/entities/attendance-record.entity';
import { HealthTeamProfilesModule } from '../health-team-profiles/health-team-profiles.module';
import { MedicalCalendarsModule } from '../medical-calendars/medical-calendars.module';
import { TopicSannaTeamsController } from './topic-sanna-teams.controller';
import { TopicCalendarsController } from './topic-calendars.controller';
import { TopicManagementProfilesController } from './topic-managment-profiles.controller';
import { TopicSannaTeamsProfilesController } from './topic-sanna-team-profiles.controller';
import { TopicCalendarsProfilesController } from './topic-calendar-profile.controller';
import { Client } from '../clients/entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalCalendar, MedicalCalendarDay, AttendanceRecord, Client]),
    UsersModule,
    SettingsModule,
    HealthTeamProfilesModule,
    MedicalCalendarsModule,
  ],
  controllers: [
    TopicManagementsController,
    TopicSannaTeamsController,
    TopicCalendarsController,
    TopicManagementProfilesController,
    TopicSannaTeamsProfilesController,
    TopicCalendarsProfilesController,
  ],
  providers: [TopicsService],
  exports: [TopicsService],
})
export class TopicsModule {}
