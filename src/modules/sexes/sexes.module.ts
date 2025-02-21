import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SexesController } from './sexes.controller';
import { SexesService } from './sexes.service';
import { Sex } from './entities/sex.entity';
import { SexExistsRule } from './decorators/sex-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([Sex])],
  controllers: [SexesController],
  providers: [SexesService, SexExistsRule],
  exports: [SexesService],
})
export class SexModule {}
