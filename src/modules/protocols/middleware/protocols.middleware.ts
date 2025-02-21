import { BadRequestException, Injectable, NestMiddleware } from "@nestjs/common";
import { ProtocolsService } from "../protocols.service";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class VerifyProtocolExists implements NestMiddleware {
  constructor(private readonly protocolsService: ProtocolsService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const protocolId = parseInt(req.params.protocolId);

    const protocol = await this.protocolsService.findOneAndFilterState(protocolId);
    if (!protocol) throw new BadRequestException('Protocolo no existe');

    next();
  }
}