import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { SessionsService } from 'src/modules/sessions/sessions.service';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class BlackListGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private sessionsService: SessionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User }>();

    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    const isInBlackList = await this.sessionsService.isInBlackList(token || '');

    if (isInBlackList) {
      throw new UnauthorizedException('La sesión ha expirado');
    }

    return true;
  }
}
