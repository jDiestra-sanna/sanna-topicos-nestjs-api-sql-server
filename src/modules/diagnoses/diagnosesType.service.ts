import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiagnosisType } from './entities/diagnosis-type.entity';
import { Repository } from 'typeorm';
import { ReqQuery } from './dto/req-query-diagnosis-type.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { BaseEntityState } from 'src/common/entities/base.entity';

@Injectable()
export class DiagnosisTypesService {
  constructor(@InjectRepository(DiagnosisType) private diagnosisTypeRepository: Repository<DiagnosisType>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<DiagnosisType>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.diagnosisTypeRepository.createQueryBuilder('diagnosisType');

    qb.where('diagnosisType.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.query) {
      qb.andWhere('CONCAT(diagnosisType.name) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(diagnosisType.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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

  async diagnosisTypeExists(id: number): Promise<boolean> {
    return await this.diagnosisTypeRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
