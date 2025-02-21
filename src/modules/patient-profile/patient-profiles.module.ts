import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientProfile } from './entity/patient-profile.entity';
import { PatientProfilesService } from './patient-profiles.service';
import { PatientProfileExistsRule } from './decorators/patient-profile-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([PatientProfile])],
  controllers: [],
  providers: [PatientProfilesService, PatientProfileExistsRule],
  exports: [PatientProfilesService, TypeOrmModule],
})
export class PatientProfilesModule {}
