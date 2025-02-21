import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ReqQuery } from './dto/req-query.dto';
import { Log } from './entities/log.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { LogType } from './entities/log-type.dto';
import { CreateLogDto } from './dto/create-log.dto';
import { LogTarget } from './entities/log-target';
import { DataChanged } from './data-changed.interface';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private logsRepository: Repository<Log>,
  ) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<Log>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.logsRepository.createQueryBuilder('log');

    qb.leftJoinAndMapOne('log.user', User, 'user', 'user.id = log.user_id');
    qb.leftJoinAndMapOne('user.role', Role, 'role', 'role.id = user.role_id');
    qb.leftJoinAndMapOne(
      'log.log_type',
      LogType,
      'log_type',
      'log_type.id = log.log_type_id',
    );
    qb.leftJoinAndMapOne(
      'log.log_target',
      LogTarget,
      'log_target',
      'log_target.id = log.log_target_id',
    );
    qb.leftJoinAndMapOne(
      'log.parent_log_target',
      LogTarget,
      'parent_log_target',
      'parent_log_target.id = log.parent_log_target_id',
    );
    qb.select([
      'log',
      'user.id',
      'user.name',
      'user.surname',
      'role.id',
      'role.name',
      'log_type.id',
      'log_type.icon',
      'log_type.color',
      'log_type.prefix',
      'log_type.name',
      'log_type.suffix',
      'log_target.id',
      'log_target.name',
      'log_target.label',
      'parent_log_target.id',
      'parent_log_target.name',
      'parent_log_target.label',
    ]);

    if (req_query.target_row_id) {
      qb.andWhere('log.target_row_id = :target_row_id', {
        target_row_id: req_query.target_row_id,
      });
    }

    if (req_query.user_id > 0) {
      qb.andWhere('log.user_id = :user_id', { user_id: req_query.user_id });
    }

    if (req_query.log_type_id > 0) {
      qb.andWhere('log.log_type_id = :log_type_id', {
        log_type_id: req_query.log_type_id,
      });
    }

    if (req_query.log_target_id) {
      qb.andWhere('log.log_target_id = :log_target_id', {
        log_target_id: req_query.log_target_id,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(log.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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

  async create(createLogDto: CreateLogDto) {
    this.logsRepository.save(createLogDto);
  }

  getDataChanged(originalObj: Record<string, any>, propsChanged: Record<string, any>) {
    let dataChanged: DataChanged = {};

    Object.keys(propsChanged).forEach(key => {
      const originalValue = originalObj[key];
      const newValue = propsChanged[key];

      if (originalValue === newValue) return;
      
      dataChanged[key] = {
        old: originalValue,
        new: newValue
      }
    })

    if (!Object.keys(dataChanged).length) return null;
    return dataChanged;
  }

  getDataChangedJson(originalObj: Record<string, any>, propsChanged: Record<string, any>) {
    const dataChanged = this.getDataChanged(originalObj, propsChanged)
    if (!dataChanged) return '';
    return JSON.stringify(dataChanged);
  }
}
