import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Repository } from 'typeorm';
import { ReqQuery } from './dto/req-query.dto';
import { FileType } from './entities/file-type.entity';

@Injectable()
export class FileTypesService {
  constructor(
    @InjectRepository(FileType)
    private fileTypesRepository: Repository<FileType>,
  ) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<FileType>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.fileTypesRepository.createQueryBuilder();

    qb.where('state != :state', { state: BaseEntityState.DELETED });

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

  async fileTypeExists(id: number) {
    return await this.fileTypesRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
