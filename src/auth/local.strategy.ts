import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private readonly entityManager: EntityManager,
  ) {
    super();
  }

  async validate(username: string, password: string) {
    const result = await this.entityManager.query(
      'DECLARE @is_locked smallint; EXEC [sanna].[CheckIfUserLocked] @login_email = @0, @is_locked = @is_locked OUTPUT;',
      [username]
    );

    const isLocked = result[0][''];
 
    if (isLocked)
      throw new UnauthorizedException(
        'Usted esta bloqueado temporalmente por exceso de intentos. Intente nuevamente en 15 minutos',
      );

    const user = await this.authService.validateUser(username, password);

    if (!user) {
      await this.entityManager.query('EXEC [sanna].[IncrementLoginAttempts] @login_email = @0', [username])
      throw new UnauthorizedException('Correo o contraseña incorrecto');
    }

    if (user.state !== BaseEntityState.ENABLED || user.role.state !== BaseEntityState.ENABLED) {
      throw new UnauthorizedException('No autorizado');
    }

    await this.entityManager.query('EXEC [sanna].[ResetLoginAttempts] @login_email = @0', [username])

    return user;
  }
}
