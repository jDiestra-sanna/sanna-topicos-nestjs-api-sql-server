import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { getEndpointByUrl } from 'src/common/helpers/generic';
import { User } from 'src/modules/users/entities/user.entity';

// rutas definidas en los controladores
// rutas que no tienen un modulo en el cms
const IGNORED_URLS = [
  'static-images',
  'auth/logout',
  'log-types',
  'log-targets',
  'files',
  'dropdown-options',
  'testing',
  'attendance-records',
  'notifications',
];

@Injectable()
export class PermsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request & { user: User }>();

    const isIgnoredUrlFound = IGNORED_URLS.some(url => {
      if (request.path.includes(getEndpointByUrl(url))) return true;
    });

    if (isIgnoredUrlFound) return true;

    const isFound = request.user?.role.perms.some(perm => {
      if (!perm.module.url) return false;

      const moduleEndpoint = getEndpointByUrl(perm.module.url);

      // solo debe validar cuando perm.module.url tiene un valor
      // request.path podria ser: /api/v1/users/1
      // moduleEndpoint podria ser: /api/v1/users
      if (!request.path.includes(moduleEndpoint)) return false;

      if (request.method === 'GET' && perm.see) return true;
      if (request.method === 'POST' && perm.create) return true;
      if (['PUT', 'PATCH'].includes(request.method) && perm.edit) return true;
      if (request.method === 'DELETE' && perm.delete) return true;
    });

    if (!isFound) throw new ForbiddenException('No autorizado');

    return isFound;
  }
}
