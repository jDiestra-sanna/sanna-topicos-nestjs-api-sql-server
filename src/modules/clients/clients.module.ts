import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsModule } from '../logs/logs.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { GroupModule } from '../groups/groups.module';
import { SettingsModule } from '../settings/settings.module';
import { ClientExistsRule } from './decorators/client-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([Client]), LogsModule, GroupModule, SettingsModule],
  controllers: [ClientsController],
  providers: [ClientsService, ClientExistsRule],
  exports: [TypeOrmModule, ClientsService],
})
export class ClientsModule {}
