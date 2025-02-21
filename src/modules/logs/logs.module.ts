import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { LogType } from './entities/log-type.dto';
import { LogTypesController } from './log-types.controller';
import { LogTypesService } from './log-types.service';
import { LogTargetsService } from './log-targets.service';
import { LogTargetsController } from './log-targets.controllers';
import { LogTarget } from './entities/log-target';
import { LogTypeExistsRule } from './decorators/log-type-exists.decorator';
import { LogTargetExistsRule } from './decorators/log-target-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([Log, LogType, LogTarget])],
  controllers: [LogsController, LogTypesController, LogTargetsController],
  providers: [LogsService, LogTypesService, LogTargetsService, LogTypeExistsRule, LogTargetExistsRule],
  exports: [LogsService, LogTypesService, LogTargetsService],
})
export class LogsModule {}
