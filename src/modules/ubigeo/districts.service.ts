import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Repository } from 'typeorm';
import { ReqQueryDistrict } from './dto/req-query-district.dto';
import { UbigeoPeruDeparment } from './entities/departments.entity';
import { UbigeoPeruDistrict } from './entities/district.entity';
import { UbigeoPeruProvince } from './entities/province.entity';

@Injectable()
export class UbigeoPeruDistrictsService {
  constructor(@InjectRepository(UbigeoPeruDistrict) private districtsRepository: Repository<UbigeoPeruDistrict>) {}

  async findAll(req_query: ReqQueryDistrict): Promise<PaginatedResult<UbigeoPeruDistrict>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.districtsRepository.createQueryBuilder('district');
    qb.leftJoinAndMapOne(
      'district.department',
      UbigeoPeruDeparment,
      'department',
      'department.id = district.department_id',
    );
    qb.leftJoinAndMapOne('district.province', UbigeoPeruProvince, 'province', 'province.id = district.province_id');

    if (req_query.query) {
      qb.andWhere('CONCAT(district.name) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.department_id) {
      qb.andWhere('district.department_id = :department_id', { department_id: req_query.department_id });
    }

    if (req_query.province_id) {
      qb.andWhere('district.province_id = :province_id', { province_id: req_query.province_id });
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

  async ubigeoPeruDistrictExists(id: number) {
    return await this.districtsRepository.createQueryBuilder().where('id = :id', { id }).getExists();
  }
}
