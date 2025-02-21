import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Repository } from 'typeorm';
import { ReqQuery } from './dto/req-query.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { User } from '../users/entities/user.entity';
import { UserType } from '../users/entities/type-user.entity';
import { getSystemDatetime } from 'src/common/helpers/date';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
  ) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<Session>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.sessionsRepository.createQueryBuilder('session');

    qb.leftJoinAndMapOne('session.user', User, 'user', 'user.id = session.user_id');
    qb.leftJoinAndMapOne('user.user_type', UserType, 'user_type', 'user_type.id = user.user_type_id');
    qb.where('user.state != :state', { state: BaseEntityState.DELETED });
    qb.select([
      'session',
      'user.id',
      'user.name',
      'user.surname',
      'user.user_type_id',
      'user_type.id',
      'user_type.name',
    ]);

    if (req_query.query) {
      qb.andWhere('CONCAT(user.name, user.surname, session.uuid) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(session.date_created AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: req_query.date_from,
        date_to: req_query.date_to,
      });
    }

    const total = await qb.getCount();

    qb.skip(skip);
    qb.take(req_query.limit);
    qb.orderBy(req_query.order_col, req_query.order_dir);

    const items = await qb.getMany();

    return {
      total,
      items,
      limit: req_query.limit,
      page: req_query.page,
    };
  }

  async findOne(id: number): Promise<Session | null> {
    let qb = this.sessionsRepository.createQueryBuilder('session');

    qb.leftJoinAndMapOne('session.user', User, 'user', 'user.id = session.user_id');
    qb.leftJoinAndMapOne('user.user_type', UserType, 'user_type', 'user_type.id = user.user_type_id');
    qb.where('user.state != :state', { state: BaseEntityState.DELETED });
    qb.select([
      'session',
      'user.id',
      'user.name',
      'user.surname',
      'user.user_type_id',
      'user_type.id',
      'user_type.name',
    ]);
    qb.where('session.id = :id', { id });

    return qb.getOne();
  }

  async findOneBy(token: string) {
    return await this.sessionsRepository.findOneBy({ token });
  }

  async getLastActiveSession(userId: number) {
    return await this.sessionsRepository.createQueryBuilder()
      .where('user_id = :userId', { userId })
      .andWhere('state = :state', { state: BaseEntityState.ENABLED })
      .andWhere('date_expiration > getDate()')
      .orderBy('date_created', 'DESC')
      .getOne();
  }

  async create(createSessionDto: CreateSessionDto): Promise<number> {
    const newSession = await this.sessionsRepository.save(createSessionDto);

    return newSession.id;
  }

  async remove(id: number, forever: boolean = false) {
    const session = await this.sessionsRepository.findOneBy({ id });

    if (!session) return;

    if (forever) {
      await this.sessionsRepository.delete(id);
    } else {
      session.state = BaseEntityState.DELETED;
      session.date_deleted = getSystemDatetime();

      await this.sessionsRepository.save(session);
    }
  }

  async removeByToken(token: string, forever: boolean = false) {
    const session = await this.sessionsRepository.findOneBy({ token });

    if (!session) return;

    if (forever) {
      await this.sessionsRepository.delete(session.id);
    } else {
      session.state = BaseEntityState.DELETED;
      session.date_deleted = getSystemDatetime();

      await this.sessionsRepository.save(session);
    }
  }

  async removeManyByUserId(id: number, forever: boolean = false) {
    if (forever) {
      await this.sessionsRepository.delete({ user_id: id });
      return;
    }

    await this.sessionsRepository.update(
      { user_id: id, state: BaseEntityState.ENABLED },
      { state: BaseEntityState.DELETED, date_deleted: getSystemDatetime() },
    );
  }

  async removeExpiredTokens() {
    await this.sessionsRepository
      .createQueryBuilder()
      .update()
      .set({
        state: BaseEntityState.DELETED,
        date_deleted: getSystemDatetime(),
      })
      .where('date_expiration < getDate()')
      .andWhere('state = :state', { state: BaseEntityState.ENABLED })
      .execute();
  }

  async isInBlackList(token: string): Promise<boolean> {
    const session = await this.sessionsRepository.findOne({
      where: { token: token, state: BaseEntityState.ENABLED },
    });

    return !session;
  }

  async sessionExists(id: number) {
    return await this.sessionsRepository
      .createQueryBuilder('sessions')
      .where('id = :id', { id })
      .andWhere('state = :state', { state: BaseEntityState.ENABLED })
      .getExists();
  }

  async isUserLoggedIn(userId: number) {
    const qb = this.sessionsRepository.createQueryBuilder();
    qb.where('user_id = :userId', { userId });
    qb.andWhere('state = :state', { state: BaseEntityState.ENABLED });
    qb.andWhere('date_expiration > getdate()');

    return await qb.getExists();
  }
}
