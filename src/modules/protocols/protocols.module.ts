import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Protocol } from './entities/protocol.entity';
import { ProtocolsService } from './protocols.service';
import { ProtocolsController } from './protocols.controller';
import { LogsModule } from '../logs/logs.module';
import { ProtocolTypesModule } from './protocol-types.module';
import { ClientExistsRule } from './validators/protocol-client.validator';
import { ClientsModule } from '../clients/clients.module';
import { AttendanceRecordsModule } from '../attendance-records/attendance-records.module';
import { CampusModule } from '../campus/campus.module';
import { ProtocolTypeExistsRule } from './decorators/protocol-type-exists.decorator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Protocol]),
    LogsModule,
    ProtocolTypesModule,
    ClientsModule,
    AttendanceRecordsModule,
    CampusModule,
  ],
  controllers: [ProtocolsController],
  providers: [ProtocolsService, ProtocolTypeExistsRule, ClientExistsRule],
  exports: [ProtocolsService],
})
export class ProtocolsModule {}
