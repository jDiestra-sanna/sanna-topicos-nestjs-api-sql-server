import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Repository } from 'typeorm';
import { ReqQueryProvince } from './dto/req-query-province.dto';
import { UbigeoPeruProvince } from './entities/province.entity';
import { UbigeoPeruDeparment } from './entities/departments.entity';

@Injectable()
export class UbigeoPeruProvincesService {
  constructor(@InjectRepository(UbigeoPeruProvince) private provincesRepository: Repository<UbigeoPeruProvince>) {}

  async findAll(req_query: ReqQueryProvince): Promise<PaginatedResult<UbigeoPeruProvince>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.provincesRepository.createQueryBuilder('province');
    qb.leftJoinAndMapOne(
      'province.department',
      UbigeoPeruDeparment,
      'department',
      'department.id = province.department_id',
    );

    if (req_query.query) {
      qb.andWhere('CONCAT(province.name) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.department_id) {
      qb.andWhere('province.department_id = :department_id', { department_id: req_query.department_id });
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

  async ubigeoPeruProvinceExists(id: number) {
    return await this.provincesRepository.createQueryBuilder().where('id = :id', { id }).getExists();
  }
}
