import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { SubProtocolsService } from '../subprotocols.service';

@Injectable()
export class VerifyProtocolSubProtocolRelation implements NestMiddleware {
  constructor(private readonly subProtocolsService: SubProtocolsService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const protocolId = parseInt(req.params.protocolId);
    const subprotocolId = parseInt(req.params.id);

    const exists = await this.subProtocolsService.findsubProtocolBelongsToProtocol(protocolId, subprotocolId);
    if (!exists) throw new BadRequestException('No existe el Subprotocolo asociado al Protocolo');

    next();
  }
}