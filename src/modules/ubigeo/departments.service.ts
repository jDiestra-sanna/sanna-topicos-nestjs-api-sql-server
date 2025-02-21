import { Injectable } from '@nestjs/common';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { UbigeoPeruDeparment } from './entities/departments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReqQueryDepartment } from './dto/req-query-department.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';

@Injectable()
export class UbigeoPeruDepartmentsService {
  constructor(@InjectRepository(UbigeoPeruDeparment) private deparmentsRepository: Repository<UbigeoPeruDeparment>) {}

  async findAll(req_query: ReqQueryDepartment): Promise<PaginatedResult<UbigeoPeruDeparment>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.deparmentsRepository.createQueryBuilder('department');

    if (req_query.query) {
      qb.andWhere('CONCAT(department.name) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
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

  async ubigeoPeruDepartmentExists(id: number) {
    return await this.deparmentsRepository.createQueryBuilder().where('id = :id', { id }).getExists();
  }
}
