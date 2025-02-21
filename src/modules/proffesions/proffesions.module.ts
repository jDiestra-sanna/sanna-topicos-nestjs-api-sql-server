import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proffesion } from './entities/proffesion.entity';
import { ProffesionsController } from './proffesions.controller';
import { ProffesionsService } from './proffesions.service';
import { ProffesionExistsRule } from './decorators/proffesion-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([Proffesion])],
  controllers: [ProffesionsController],
  providers: [ProffesionsService, ProffesionExistsRule],
  exports: [ProffesionsService],
})
export class ProffesionModule {}
