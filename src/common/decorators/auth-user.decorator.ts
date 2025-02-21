import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User as UserEntity } from 'src/modules/users/entities/user.entity';

export const AuthUser = createParamDecorator(
    async (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request & { user: UserEntity }>();

        if (request.user?.id > 0) return request.user;

        return null;
    },
);