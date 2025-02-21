import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsModule } from '../logs/logs.module';
import { Campus } from './entities/campus.entity';
import { CampusController } from './campus.controller';
import { CampusService } from './campus.service';
import { ClientsModule } from '../clients/clients.module';
import { SettingsModule } from '../settings/settings.module';
import { CampusExistsRule } from './decorators/campus-exists.decorator';
import { CampusSchedulesModule } from '../campus-schedules/campus-schedules.module';

@Module({
  imports: [TypeOrmModule.forFeature([Campus]), LogsModule, ClientsModule, SettingsModule, CampusSchedulesModule],
  controllers: [CampusController],
  providers: [CampusService, CampusExistsRule],
  exports: [TypeOrmModule, CampusService],
})
export class CampusModule {}
