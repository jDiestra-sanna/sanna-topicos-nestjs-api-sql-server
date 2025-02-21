import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Repository } from 'typeorm';
import { DocumentType } from './entities/document-types.entity';
import { ReqQuery } from './dto/req-query.dto';

@Injectable()
export class DocumentTypesService {
  constructor(
    @InjectRepository(DocumentType)
    private documentTypesRepository: Repository<DocumentType>,
  ) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<DocumentType>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.documentTypesRepository.createQueryBuilder();

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

  async documentTypeExists(id: number): Promise<boolean> {
    return await this.documentTypesRepository
      .createQueryBuilder('document_type')
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
