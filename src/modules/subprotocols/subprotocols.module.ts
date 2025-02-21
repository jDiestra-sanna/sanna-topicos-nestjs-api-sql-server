import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubProtocol } from './entities/subprotocol.entity';
import { LogsModule } from '../logs/logs.module';
import { SubProtocolsService } from './subprotocols.service';
import { SubProtocolsController } from './subprotocols.controller';
import { ProtocolsModule } from '../protocols/protocols.module';
import { VerifyProtocolSubProtocolRelation } from './middleware/subprotocol.middleware';
import { VerifyProtocolExists } from '../protocols/middleware/protocols.middleware';
import { SubprotocolExistsRule } from './decorators/subprotocol-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([SubProtocol]), LogsModule, ProtocolsModule],
  controllers: [SubProtocolsController],
  providers: [SubProtocolsService, SubprotocolExistsRule],
  exports: [SubProtocolsService],
})
export class SubProtocolsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyProtocolSubProtocolRelation)
      .forRoutes(
        { path: 'protocols/:protocolId/subprotocols/:id', method: RequestMethod.PATCH },
        { path: 'protocols/:protocolId/subprotocols/:id', method: RequestMethod.DELETE },
        { path: 'protocols/:protocolId/subprotocols/:id/state', method: RequestMethod.PATCH },
      )
      .apply(VerifyProtocolExists)
      .forRoutes({ path: 'protocols/:protocolId/subprotocols', method: RequestMethod.POST });
  }
}
