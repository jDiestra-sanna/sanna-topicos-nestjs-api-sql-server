import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReqQuery } from './dto/req-query.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { AttendancePlace } from './entities/attendance-place.entity';
import { BaseEntityState } from 'src/common/entities/base.entity';

@Injectable()
export class AttendancePlacesService {
  constructor(@InjectRepository(AttendancePlace) private attendancePlacesRepository: Repository<AttendancePlace>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<AttendancePlace>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.attendancePlacesRepository.createQueryBuilder('attendance_places');

    qb.where('attendance_places.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.query) {
      qb.andWhere('CONCAT(attendance_places.name) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(attendance_places.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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

  async attendancePlaceExists(id: number): Promise<boolean> {
    return await this.attendancePlacesRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
