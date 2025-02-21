import { Controller } from '@nestjs/common';
import { HealthTeamProfilesController } from '../health-team-profiles/health-team-profiles.controller';

@Controller('topic-calendars/health-team-profiles')
export class TopicCalendarsProfilesController extends HealthTeamProfilesController {}
