import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { LogsModule } from '../logs/logs.module';
import { SessionExistsRule } from './decorators/session-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), LogsModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionExistsRule],
  exports: [SessionsService],
})
export class SessionsModule { }
