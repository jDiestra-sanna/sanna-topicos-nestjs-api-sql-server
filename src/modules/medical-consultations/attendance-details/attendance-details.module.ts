import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceDetail } from './entities/attendance-detail.entity';
import { AttendanceDetailsService } from './attendance-details.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceDetail])],
  controllers: [],
  providers: [AttendanceDetailsService],
  exports: [AttendanceDetailsService],
})
export class AttendanceDetailsModule {}
