import { BadRequestException, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { ProtocolFilesService } from "../protocol-files.service";

@Injectable()
export class VerifyProtocolFileBelongsToProtocol implements NestMiddleware {
  constructor(private readonly protocolFilesService: ProtocolFilesService ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const protocolId = parseInt(req.params.protocolId)
    const protocolFileId = parseInt(req.params.id)

    const exists = await this.protocolFilesService.protocolFileBelongsToProtocol(protocolFileId, protocolId)
    if (!exists) throw new BadRequestException('No existe archivo para el protocolo')

    next()
  }
}
