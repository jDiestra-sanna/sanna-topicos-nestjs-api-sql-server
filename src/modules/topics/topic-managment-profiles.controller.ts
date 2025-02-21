import { Controller } from '@nestjs/common';
import { HealthTeamProfilesController } from '../health-team-profiles/health-team-profiles.controller';

@Controller('topic-managments/health-team-profiles')
export class TopicManagementProfilesController extends HealthTeamProfilesController {}
