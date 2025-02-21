import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { LogsModule } from '../logs/logs.module';
import { SettingsModule } from '../settings/settings.module';
import { Client } from '../clients/entities/client.entity';
import { Campus } from '../campus/entities/campus.entity';
import { GroupExistsRule } from './decorators/group-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Client, Campus]), LogsModule, SettingsModule],
  controllers: [GroupsController],
  providers: [GroupsService, GroupExistsRule],
  exports: [TypeOrmModule, GroupsService],
})
export class GroupModule {}
