import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubProtocolFile } from './entities/subprotocol-files.entity';
import { SubProtocolFilesService } from './subprotocol-files.service';
import { SubProtocolsModule } from './subprotocols.module';
import { FileModule } from 'src/files/files.module';
import { LogsModule } from '../logs/logs.module';
import { SubProtocolFilesController } from './subprotocol-files.controller';
import { FileExistsRule } from '../protocols/validators/protocol-file.validator';
import {
  VerifySubprotocolBelongsToProtocol,
  VerifySubprotocolFileBelongsToSubprotocol,
} from './middleware/subprotocol-files.middleware';
import { SubprotocolExistsRule } from './decorators/subprotocol-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([SubProtocolFile]), LogsModule, FileModule, SubProtocolsModule],
  controllers: [SubProtocolFilesController],
  providers: [SubProtocolFilesService, SubprotocolExistsRule, FileExistsRule],
  exports: [SubProtocolFilesService],
})
export class SubProtocolFilesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifySubprotocolBelongsToProtocol)
      .forRoutes(
        { path: 'protocols/:protocolId/subprotocols/:subprotocolId/subprotocol-files', method: RequestMethod.POST },
        { path: 'protocols/:protocolId/subprotocols/:subprotocolId/subprotocol-files', method: RequestMethod.GET },
      )
      .apply(VerifySubprotocolBelongsToProtocol, VerifySubprotocolFileBelongsToSubprotocol)
      .forRoutes(
        {
          path: 'protocols/:protocolId/subprotocols/:subprotocolId/subprotocol-files/:id',
          method: RequestMethod.PATCH,
        },
        {
          path: 'protocols/:protocolId/subprotocols/:subprotocolId/subprotocol-files/:id',
          method: RequestMethod.DELETE,
        },
      );
  }
}
