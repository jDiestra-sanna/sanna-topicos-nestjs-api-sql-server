import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { SubProtocolsService } from '../subprotocols.service';
import { SubProtocolFilesService } from '../subprotocol-files.service';

@Injectable()
export class VerifySubprotocolBelongsToProtocol implements NestMiddleware {
  constructor(private readonly subProtocolsService: SubProtocolsService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const protocolId = parseInt(req.params.protocolId);
    const subprotocolId = parseInt(req.params.subprotocolId);

    const exists = await this.subProtocolsService.findsubProtocolBelongsToProtocol(protocolId, subprotocolId);
    if (!exists) throw new BadRequestException('No existe el Subprotocolo asociado al Protocolo');

    next();
  }
}

@Injectable()
export class VerifySubprotocolFileBelongsToSubprotocol implements NestMiddleware {
  constructor(private readonly subprotocolFilesService: SubProtocolFilesService ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const subprotocolId = parseInt(req.params.subprotocolId)
    const subprotocolFileId = parseInt(req.params.id)

    const exists = await this.subprotocolFilesService.subprotocolFileBelongsToSubprotocol(subprotocolFileId, subprotocolId)
    if (!exists) throw new BadRequestException('No existe archivo para el subprotocolo')

    next()
  }
}
