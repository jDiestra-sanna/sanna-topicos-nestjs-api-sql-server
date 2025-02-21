import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { RolesModule } from 'src/modules/roles/roles.module';
import { ModuleModule } from 'src/modules/modules/modules.module';
import { SettingsModule } from 'src/modules/settings/settings.module';
import { SessionsModule } from 'src/modules/sessions/sessions.module';
import { HttpModule } from '@nestjs/axios';
import { MailsModule } from 'src/mails/mails.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './token.entity';
import { MedicalCalendarsModule } from 'src/modules/medical-calendars/medical-calendars.module';
import { LogsModule } from 'src/modules/logs/logs.module';
import { TotpService } from 'src/modules/totp/totp.service';
import { TOTPStrategy } from './totp.strategy';
import { AttendanceRecordsModule } from 'src/modules/attendance-records/attendance-records.module';

@Module({
  imports: [
    LogsModule,
    MedicalCalendarsModule,
    MailsModule,
    HttpModule,
    SessionsModule,
    SettingsModule,
    ModuleModule,
    RolesModule,
    UsersModule,
    PassportModule,
    AttendanceRecordsModule,
    TypeOrmModule.forFeature([Token]),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET_KEY,
        signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, TotpService, TOTPStrategy],
})
export class AuthModule {}
