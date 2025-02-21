import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtocolTypesService } from './protocol-types.service';
import { ProtocolType } from './entities/protocol-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProtocolType])],
  providers: [ProtocolTypesService],
  exports: [ProtocolTypesService],
})
export class ProtocolTypesModule {}
