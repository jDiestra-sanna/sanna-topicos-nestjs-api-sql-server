import { CampusModule } from '../campus/campus.module';
import { LogsModule } from '../logs/logs.module';
import { MedicalCalendarsModule } from '../medical-calendars/medical-calendars.module';
import { Module } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), LogsModule, UsersModule, MedicalCalendarsModule, CampusModule, AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [TypeOrmModule, NotificationsService],
})
export class NotificationsModule {}
