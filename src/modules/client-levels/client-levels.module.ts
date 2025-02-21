import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientLevel } from './entities/client-level.entity';
import { ClientLevelsService } from './client-levels.service';
import { ClientLevelExistsRule } from './decorators/client-level-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([ClientLevel])],
  controllers: [],
  providers: [ClientLevelsService, ClientLevelExistsRule],
  exports: [ClientLevelsService],
})
export class ClientLevelsModule {}
