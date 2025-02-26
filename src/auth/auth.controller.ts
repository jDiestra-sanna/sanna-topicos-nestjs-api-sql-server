import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SkipAuth } from 'src/common/decorators/public.decorator';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { getSystemDate, getSystemTime, timestampToDate } from 'src/common/helpers/date';
import { extractTokenFromHeader } from 'src/common/helpers/generic';
import { rspOk, rspOkDeleted } from 'src/common/helpers/http-responses';
import { MailsService } from 'src/mails/mails.service';
import { MedicalCalendarsService } from 'src/modules/medical-calendars/medical-calendars.service';
import { ModulesService } from 'src/modules/modules/modules.service';
import { RoleIds } from 'src/modules/roles/entities/role.entity';
import { RolesService } from 'src/modules/roles/roles.service';
import { SessionsService } from 'src/modules/sessions/sessions.service';
import { SettingsService } from 'src/modules/settings/settings.service';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersService } from 'src/modules/users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RecoverDto } from './dto/recover.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { RecaptchaGuard } from './recaptcha.guard';
import { ResetPasswordDto } from './reset-password.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { LogsService } from 'src/modules/logs/logs.service';
import { LogTypesIds } from 'src/modules/logs/entities/log-type.dto';
import { UserAssignmentsService } from 'src/modules/users/user-assignments.service';
import { QueryFindAll } from 'src/modules/users/dto/req-query-user-assignment.dto';
import { TotpService } from 'src/modules/totp/totp.service';
import { TOTPGuard } from './totp.guard';
import { LoggedInDto } from './dto/logged-in.dto';
import { AttendanceRecordsService } from 'src/modules/attendance-records/attendance-records.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private modulesService: ModulesService,
    private rolesService: RolesService,
    private settingService: SettingsService,
    private sessionsService: SessionsService,
    private usersService: UsersService,
    private userAssignmentsService: UserAssignmentsService,
    private mailsService: MailsService,
    private medicalCalendarsService: MedicalCalendarsService,
    private logsService: LogsService,
    private totpService: TotpService,
    private attendanceRecordsService: AttendanceRecordsService,
  ) {}

  @SkipAuth()
  @Get('verify')
  async verify(@Res() res: Response, @Req() req: Request & { user: User }) {
    const setting = await this.settingService.getMappedToOne();
    setting['debug'] = process.env.NODE_ENV !== 'production';

    const token = extractTokenFromHeader(req);
    const payload = await this.authService.getPayloadFromToken(token || '');
    let user: User = null;

    if (payload) {
      user = await this.authService.getUserByPayload(payload);
    }

    let userData = null;
    let role = null;
    let url_home = '/home';
    let menu = [];

    if (user) {
      const homeModule = await this.modulesService.findOne(user.role.home_module_id);
      url_home = '/' + homeModule.url;

      role = 'admin';

      menu = this.rolesService.nestModules(user.role.perms.filter(perm => perm.interface > 0));

      const userAssignmentsResult = await this.userAssignmentsService.findAll({
        ...new QueryFindAll(),
        user_id: user.id,
      });

      const current_medical_calendar = await this.medicalCalendarsService.findOneByDay(getSystemDate(), user.id);

      userData = {
        id: user.id,
        user_type_id: user.user_type_id,
        name: user.name,
        surname: `${user.surname_first} ${user.surname_second}`,
        displayName: `${user.name} ${user.surname_first} ${user.surname_second}`,
        pic: user.pic,
        email: user.email,
        role_id: user.role.id,
        role_name: user.role.name,
        is_central: user.is_central,
        assignments: userAssignmentsResult.items,
        current_medical_calendar: current_medical_calendar,
        proffesion_id: user.proffesion_id,
        shortcuts: [],
        settings: {
          layout: {
            config: {
              navbar: {
                folded: user.role.menu_collapsed > 0,
              },
              footer: {
                display: false,
                style: 'static',
              },
            },
          },
          theme: {
            main: 'default',
          },
        },
      };
    }

    return rspOk(res, {
      token: '',
      user: {
        role: role,
        data: userData,
        url_home: url_home,
        base_dir: '',
        menu: menu,
        settings: setting,
      },
    });
  }

  @SkipAuth()
  @Post('status-logged-in')
  async isLoggedIn(@Body() body: LoggedInDto, @Res() res: Response) {
    const data = { isLoggedIn: false };
    const user = await this.usersService.findOneByEmail(body.email);

    if (!user) return rspOk(res, data);

    data.isLoggedIn = await this.sessionsService.isUserLoggedIn(user.id);

    return rspOk(res, data);
  }

  @SkipAuth()
  // @UseGuards(RecaptchaGuard)
  @UseGuards(LocalAuthGuard)
  @Post('pre-login')
  async preLogin(@Body() body: LoginDto, @Res() res: Response, @Req() req: Request & { user: User }) {
    const user = req.user;

    if (user.role_id === RoleIds.ROOT) {
      const token = await this.authService.login(req.user);
      const jwtPayload = await this.authService.getPayloadFromToken(token.access_token);

      await this.sessionsService.removeManyByUserId(req.user.id);

      await this.sessionsService.create({
        token: token.access_token,
        date_expiration: timestampToDate(jwtPayload.exp),
        user_id: req.user.id,
        ...body,
      });

      await this.sessionsService.removeExpiredTokens();

      await this.logsService.create({
        log_type_id: LogTypesIds.LOGIN,
        user_id: req.user.id,
      });

      return rspOk(res, {
        id: req.user.id,
        role_id: req.user?.role_id,
        name: req.user.name,
        surname: req.user.surname,
        pic: req.user.pic,
        role_name: req.user.role.name,
        access_token: token.access_token,
      });
    }

    if (user.oauth_secret_key && user.secret_key_approved) {
      return rspOk(res);
    } else {
      const oauthSecretKey = this.totpService.generateSecret().base32;
      const environment = process.env.NODE_ENV === 'local' ? '[LOCAL] ' : process.env.NODE_ENV === 'development' ? '[BETA] ' : '';
      const label = `${environment}SANNA:${user.email}`;
      const qrCode = await this.totpService.generateQRCode(oauthSecretKey, label);
      await this.usersService.update(user.id, { oauth_secret_key: oauthSecretKey });
      return rspOk(res, qrCode);
    }
  }

  @SkipAuth()
  @UseGuards(TOTPGuard)
  @Post('login')
  async login(@Body() body: LoginDto, @Res() res: Response, @Req() req: Request & { user: User }) {
    const lastSession = await this.sessionsService.getLastActiveSession(req.user.id);
    const isHealthTeam = req.user.role_id === RoleIds.HEALTH_TEAM;

    await this.sessionsService.removeManyByUserId(req.user.id);

    if (isHealthTeam) {
      const isScheduled = await this.medicalCalendarsService.isScheduled(req.user.id);

      if (!isScheduled) throw new ForbiddenException('Usted no cuenta con programación este mes o su sede ha sido desactivada');
    }

    if (req.user.role_id === RoleIds.CLIENT) {
      const existAssignments = await this.userAssignmentsService.existUserAssignments(req.user.id);
      if (!existAssignments && !req.user.is_central)
        throw new ForbiddenException('Su usuario no tiene sedes asignadas, comuníquese con un administrador');
    }

    const token = await this.authService.login(req.user);
    const jwtPayload = await this.authService.getPayloadFromToken(token.access_token);

    const newSessionId = await this.sessionsService.create({
      token: token.access_token,
      date_expiration: timestampToDate(jwtPayload.exp),
      user_id: req.user.id,
      ...body,
    });

    if (isHealthTeam && lastSession) {
      this.attendanceRecordsService.update({ session_id: lastSession.id }, { session_id: newSessionId })
    }

    await this.sessionsService.removeExpiredTokens();

    await this.logsService.create({
      log_type_id: LogTypesIds.LOGIN,
      user_id: req.user.id,
    });

    return rspOk(res, {
      id: req.user.id,
      role_id: req.user?.role_id,
      name: req.user.name,
      surname: req.user.surname,
      pic: req.user.pic,
      role_name: req.user.role.name,
      access_token: token.access_token,
    });
  }

  @Delete('logout')
  async remove(@Req() req: Request, @Res() res: Response, @AuthUser() authUser: User) {
    const token = extractTokenFromHeader(req);
    await this.sessionsService.removeByToken(token);

    await this.logsService.create({
      log_type_id: LogTypesIds.LOGOUT,
      user_id: authUser.id,
    });

    return rspOkDeleted(res);
  }

  @SkipAuth()
  @Post('reset-password')
  async resetPassword(@Body() body: RecoverDto, @Res() res: Response) {
    const user = await this.usersService.findOneByEmail(body.username);

    if (!user) {
      throw new BadRequestException('Usuario no existe');
    }

    if (user.state !== BaseEntityState.ENABLED) {
      throw new ForbiddenException('No autorizado');
    }

    const token = await this.authService.resetPassword(user);
    const jwtPayload = await this.authService.getPayloadFromToken(token.access_token);

    await this.authService.saveToken({
      token: token.access_token,
      user_id: user.id,
      date_expiration: timestampToDate(jwtPayload.exp),
    });

    await this.authService.removeExpiredTokens();

    await this.mailsService.sendRecoverPassword(user.name, user.email, token.access_token);

    await this.logsService.create({
      log_type_id: LogTypesIds.REQUESTED_CHANGE_PASSWORD,
      user_id: user.id,
    });

    return rspOk(res);
  }

  @SkipAuth()
  @Get('reset-password/:token')
  async validateTokenResetPassword(@Param('token') token: string, @Res() res: Response) {
    await this.authService.validateToken(token);
    return rspOk(res);
  }

  @SkipAuth()
  @Put('reset-password/:token')
  async updatePassword(@Param('token') token: string, @Body() body: ResetPasswordDto, @Res() res: Response) {
    await this.authService.validateToken(token);

    if (body.password !== body.repeat_password) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const jwtPayload = await this.authService.getPayloadFromToken(token);
    await this.usersService.update(jwtPayload.sub, { password: body.password });
    await this.sessionsService.removeManyByUserId(jwtPayload.sub);
    await this.authService.removeToken(token);
    const user = await this.usersService.findOne(jwtPayload.sub);

    await this.logsService.create({
      log_type_id: LogTypesIds.CHANGED_PASSWORD,
      user_id: user.id,
    });

    return rspOk(res);
  }
}
