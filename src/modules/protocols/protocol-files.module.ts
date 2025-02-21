import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtocolFile } from './entities/protocol-files.entity';
import { ProtocolFilesService } from './protocol-files.service';
import { ProtocolFilesController } from './protocol-files.controller';
import { LogsModule } from '../logs/logs.module';
import { FileModule } from 'src/files/files.module';
import { FileExistsRule } from './validators/protocol-file.validator';
import { ProtocolsModule } from './protocols.module';
import { VerifyProtocolExists } from './middleware/protocols.middleware';
import { VerifyProtocolFileBelongsToProtocol } from './middleware/protocol-files.middleware';
import { ProtocolExistsRule } from './decorators/protocol-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([ProtocolFile]), LogsModule, FileModule, ProtocolsModule],
  controllers: [ProtocolFilesController],
  providers: [ProtocolFilesService, ProtocolExistsRule, FileExistsRule],
  exports: [ProtocolFilesService],
})
export class ProtocolFilesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyProtocolExists)
      .forRoutes(
        { path: 'protocols/:protocolId/protocol-files', method: RequestMethod.POST },
        { path: 'protocols/:protocolId/protocol-files', method: RequestMethod.GET },
      )
      .apply(VerifyProtocolFileBelongsToProtocol)
      .forRoutes(
        { path: 'protocols/:protocolId/protocol-files/:id', method: RequestMethod.PATCH },
        { path: 'protocols/:protocolId/protocol-files/:id', method: RequestMethod.DELETE },
      );
  }
}
