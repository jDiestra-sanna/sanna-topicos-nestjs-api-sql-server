import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancePlace } from './entities/attendance-place.entity';
import { AttendancePlacesService } from './attendance-places.service';
import { AttendanceDetail } from '../medical-consultations/attendance-details/entities/attendance-detail.entity';
import { AttendancePlaceExistsRule } from './decorators/attendance-place-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([AttendancePlace])],
  controllers: [],
  providers: [AttendancePlacesService, AttendancePlaceExistsRule],
  exports: [AttendancePlacesService],
})
export class AttendancePlacesModule {}
