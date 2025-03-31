import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { comparePasswords } from 'src/common/helpers/password';
import { UsersService } from 'src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/users/entities/user.entity';
import { JwtPayload } from './jwt-payload.interface';
import { RolesService } from 'src/modules/roles/roles.service';
import { Token } from './token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTokenDto } from './create-token.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { getSystemDatetime } from 'src/common/helpers/date';

@Injectable()
export class AuthService {
  constructor(
    private rolesService: RolesService,
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Token)
    private tokensRepository: Repository<Token>,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findOneByEmail(username);

    if (!user) return null;

    const passOk = await comparePasswords(pass, user.password);

    if (!passOk) return null;

    delete user.password;

    user.role = await this.rolesService.findOne(user.role_id);

    return user;
  }

  async login(user: User) {
    const payload: JwtPayload = { username: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async resetPassword(user: User) {
    const payload: JwtPayload = { username: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_RESETPASS_EXPIRATION_TIME,
      }),
    };
  }

  async saveToken(createTokenDto: CreateTokenDto) {
    await this.tokensRepository.save(createTokenDto);
  }

  async removeToken(token: string, forever: boolean = false) {
    const _token = await this.tokensRepository.findOneBy({ token });

    if (!_token) return;

    _token.state = BaseEntityState.DELETED;
    _token.date_deleted = getSystemDatetime();

    await this.tokensRepository.save(_token);
  }

  async removeExpiredTokens() {
    await this.tokensRepository
      .createQueryBuilder()
      .update()
      .set({
        state: BaseEntityState.DELETED,
        date_deleted: getSystemDatetime(),
      })
      .where('date_expiration < GETDATE()')
      .andWhere('state = :state', { state: BaseEntityState.ENABLED })
      .execute();
  }

  async isTokenInBlackList(token: string): Promise<boolean> {
    const _token = await this.tokensRepository.findOne({
      where: { token: token, state: BaseEntityState.ENABLED },
    });

    return !_token;
  }

  async validateToken(token: string) {
    const payload = await this.getPayloadFromToken(token);
    if (!payload) throw new UnauthorizedException('El token ha expirado o es invalido');

    const isInBlackList = await this.isTokenInBlackList(token);
    if (isInBlackList)
      throw new BadRequestException('El token ya ha sido utilizado');
  }

  async getUserByPayload(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.sub);

    if (!user) return null;

    delete user.password;
    user.role = await this.rolesService.findOne(user.role_id);

    return user;
  }

  async getPayloadFromToken(token: string) {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
    } catch (error) {
      return null;
    }
  }
}
