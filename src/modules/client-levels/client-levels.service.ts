import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientLevel } from './entities/client-level.entity';
import { Repository } from 'typeorm';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { ReqQuery } from './dto/req-query.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';

@Injectable()
export class ClientLevelsService {
  constructor(@InjectRepository(ClientLevel) private clientLevelsRepository: Repository<ClientLevel>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<ClientLevel>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.clientLevelsRepository.createQueryBuilder('client_level');

    qb.where('client_level.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.query) {
      qb.andWhere('CONCAT(client_level.name) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(client_level.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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

  async clientLevelExists(id: number) {
    return await this.clientLevelsRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
