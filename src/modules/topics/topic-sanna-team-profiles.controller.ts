import { Controller } from '@nestjs/common';
import { HealthTeamProfilesController } from '../health-team-profiles/health-team-profiles.controller';

@Controller('topic-sanna-teams/health-team-profiles')
export class TopicSannaTeamsProfilesController extends HealthTeamProfilesController {}
