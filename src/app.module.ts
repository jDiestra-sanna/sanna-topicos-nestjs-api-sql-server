import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './modules/roles/roles.module';
import { ModuleModule } from './modules/modules/modules.module';
import { LogsModule } from './modules/logs/logs.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PermsGuard } from './auth/perms.guard';
import { SessionsModule } from './modules/sessions/sessions.module';
import { BlackListGuard } from './auth/black-list.guard';
import { UbigeoModule } from './modules/ubigeo/ubigeo.module';
import { GroupModule } from './modules/groups/groups.module';
import { ClientsModule } from './modules/clients/clients.module';
import { CampusModule } from './modules/campus/campus.module';
import { DocumentTypeModule } from './modules/document-types/document-types.module';
import { SexModule } from './modules/sexes/sexes.module';
import { ProffesionModule } from './modules/proffesions/proffesions.module';
import { CostCenterModule } from './modules/cost-centers/cost-centers.module';
import { FileTypeModule } from './modules/file-types/file-types.module';
import { FileModule } from './files/files.module';
import { MedicalCalendarsModule } from './modules/medical-calendars/medical-calendars.module';
import { DropdownOptionsModule } from './dropdown-options/dropdown-options.module';
import { MedicalConsultationsModule } from './modules/medical-consultations/medical-consultations.module';
import { TestSpacesModule } from './modules/test-spaces/test-spaces.module';
import { HealthTeamProfilesModule } from './modules/health-team-profiles/health-team-profiles.module';
import { FormFactorModule } from './modules/form-factor/form-factor.module';
import { ArticleGroupsModule } from './modules/article-groups/article-groups.module';
import { MedicineModule } from './modules/medicines/medicines.module';
import { DiagnosesModule } from './modules/diagnoses/diagnoses.module';
import { DiagnosisTypesModule } from './modules/diagnoses/diagnosesType.module';
import { ProtocolsModule } from './modules/protocols/protocols.module';
import { ProtocolFilesModule } from './modules/protocols/protocol-files.module';
import { SubProtocolsModule } from './modules/subprotocols/subprotocols.module';
import { SubProtocolFilesModule } from './modules/subprotocols/subprotocol-files.module';
import { PatientsModule } from './modules/medical-consultations/patients/patients.module';
import { AllergiesModule } from './modules/medical-consultations/allergies/allergies.module';
import { AttendancePlacesModule } from './modules/attendance-places/attendance-places.module';
import { IllnessQuantityTypesModule } from './modules/illness-quantity-types/illness-quantity-types.module';
import { MedicalDiagnosesModule } from './modules/medical-consultations/medical-diagnoses/medical-diagnoses.module';
import { TopicsModule } from './modules/topics/topics.module';
import { ConsultationHistoriesModule } from './modules/consultation-history/consultation-history.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CustomThrottlerGuard } from './common/throttler/throttler.guard';
import { TotpModule } from './modules/totp/totp.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CampusConditionsModule } from './modules/campus-conditions/campus-conditions.module';
import { CampusSchedulesModule } from './modules/campus-schedules/campus-schedules.module';
import { ReportsModule } from './modules/reports/reports.module';

const systemModules = [
  ReportsModule,
  CampusSchedulesModule,
  CampusConditionsModule,
  TotpModule,
  ConsultationHistoriesModule,
  TopicsModule,
  SubProtocolFilesModule,
  SubProtocolsModule,
  ProtocolFilesModule,
  ProtocolsModule,
  MedicalDiagnosesModule,
  IllnessQuantityTypesModule,
  AttendancePlacesModule,
  AllergiesModule,
  MedicalConsultationsModule,
  PatientsModule,
  DiagnosisTypesModule,
  DiagnosesModule,
  ArticleGroupsModule,
  FormFactorModule,
  MedicineModule,
  HealthTeamProfilesModule,
  MedicalConsultationsModule,
  MedicalCalendarsModule,
  CostCenterModule,
  ProffesionModule,
  CampusModule,
  ClientsModule,
  GroupModule,
  DropdownOptionsModule,
  UbigeoModule,
  LogsModule,
  SettingsModule,
  SessionsModule,
  DocumentTypeModule,
  SexModule,
  TestSpacesModule,
  FileTypeModule,
  FileModule,
  UsersModule,
  RolesModule,
  ModuleModule,
  AuthModule,
  NotificationsModule,
  DashboardModule,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env.development', '.env'],
      isGlobal: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/api/v1/static-files',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        type: 'mssql',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT')),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        charset: 'utf8mb4',
        schema: 'sanna',
        // timezone: '-05:00',
        dateStrings: true,
        autoLoadEntities: true,
        options: {
          trustServerCertificate: true,
          encrypt: false,
        },
        synchronize: false,
        // synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'local',
      }),
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('THROTTLE_TTL'),
          limit: configService.get('THROTTLE_LIMIT'),
        },
      ],
    }),

    ...systemModules,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // no cambiar el orden
    { provide: APP_GUARD, useClass: PermsGuard },
    { provide: APP_GUARD, useClass: BlackListGuard },
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
  ],
})
export class AppModule {}
