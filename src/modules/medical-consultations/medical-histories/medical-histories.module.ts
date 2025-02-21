import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalHistory } from './entities/medical-history.entity';
import { MedicalHistoriesService } from './medical-histories.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalHistory])],
  controllers: [],
  providers: [MedicalHistoriesService],
  exports: [MedicalHistoriesService],
})
export class MedicalHistoriesModule {}
