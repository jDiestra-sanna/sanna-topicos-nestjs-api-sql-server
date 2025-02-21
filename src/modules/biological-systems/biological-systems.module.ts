import { BiologicalSystem } from './entities/biological-system.entity';
import { BiologicalSystemsService } from './biological-systems.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiologicalSystemExistsRule } from './decorators/biological-system-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([BiologicalSystem])],
  controllers: [],
  providers: [BiologicalSystemsService, BiologicalSystemExistsRule],
  exports: [BiologicalSystemsService, TypeOrmModule],
})
export class BiologicalSystemsModule {}
