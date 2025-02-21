import { Module } from '@nestjs/common';
import { SettingController } from './setting.controller';
import { SettingsService } from './settings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Setting]), LogsModule],
  controllers: [SettingController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule { }
