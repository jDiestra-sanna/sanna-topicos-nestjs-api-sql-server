import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { TotpService } from 'src/modules/totp/totp.service';
import { AuthService } from './auth.service';
import { UsersService } from 'src/modules/users/users.service';
import { EntityManager } from 'typeorm';
import { RoleIds } from 'src/modules/roles/entities/role.entity';

@Injectable()
export class TOTPStrategy extends PassportStrategy(Strategy, 'totp') {
  constructor(
    private readonly totpService: TotpService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly entityManager: EntityManager,
  ) {
    super();
  }

  async validate(req: Request, done: Function) {
    const { username, password, totp_code } = req.body as any;
    const user = await this.authService.validateUser(username, password);

    if (!user) throw new UnauthorizedException('No se encontró el usuario');
    if (user.role_id === RoleIds.ROOT) return done(null, user);

    const result = await this.entityManager.query(
      'DECLARE @is_locked smallint; EXEC [sanna].[CheckIfUserLocked] @login_email = @0, @is_locked = @is_locked OUTPUT;',
      [username],
    );

    const isLocked = result[0][''];

    if (isLocked)
      throw new UnauthorizedException(
        'Usted esta bloqueado temporalmente por exceso de intentos. Intente nuevamente en 15 minutos',
      );

    const secret = user.oauth_secret_key;
    if (!secret)
      throw new BadRequestException(
        'Usted no cuenta con un código de verificación. Por favor póngase en contacto con un administrador',
      );
    const isValid = this.totpService.verifyToken(secret, totp_code);

    if (isValid) {
      await this.entityManager.query('EXEC [sanna].[ResetLoginAttempts] @login_email = @0', [username]);
      await this.usersService.update(user.id, { secret_key_approved: true });
      return done(null, user);
    } else {
      await this.entityManager.query('EXEC [sanna].[IncrementLoginAttempts] @login_email = @0', [username]);
      throw new UnauthorizedException('Código de verificación incorrecto');
    }
  }
}
