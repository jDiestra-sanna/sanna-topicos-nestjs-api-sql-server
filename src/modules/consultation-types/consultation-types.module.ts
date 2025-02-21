import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultationType } from './entities/consultation-type.entity';
import { ConsultationTypesService } from './consultation-types.service';
import { AttendanceDetail } from '../medical-consultations/attendance-details/entities/attendance-detail.entity';
import { ConsultationTypeExistsRule } from './decorators/consultation-type-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([ConsultationType, AttendanceDetail])],
  controllers: [],
  providers: [ConsultationTypesService, ConsultationTypeExistsRule],
  exports: [ConsultationTypesService],
})
export class ConsultationTypesModule {}
