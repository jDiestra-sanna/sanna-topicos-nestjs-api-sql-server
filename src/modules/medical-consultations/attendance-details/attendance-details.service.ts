import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceDetail } from './entities/attendance-detail.entity';
import { Repository } from 'typeorm';
import { ReqQuery } from './dto/req-query';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { CreateAttendanceDetailDto } from './dto/create-attendance-details.dto';
import { UpdateAttendanceDetailDto } from './dto/update-attendance-details.dto';
import { getSystemDatetime } from 'src/common/helpers/date';

@Injectable()
export class AttendanceDetailsService {
  constructor(@InjectRepository(AttendanceDetail) private attendanceDetailsRepository: Repository<AttendanceDetail>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<AttendanceDetail>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.attendanceDetailsRepository.createQueryBuilder('attendance_details');

    qb.leftJoinAndSelect('attendance_details.consultation_type', 'consultation_type');
    qb.leftJoinAndSelect('attendance_details.attendance_place', 'attendance_place');
    qb.leftJoinAndSelect('attendance_details.illness_quantity_type', 'illness_quantity_type');
    qb.leftJoinAndSelect('attendance_details.medical_consultation', 'medical_consultation');

    qb.andWhere('attendance_details.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.medical_consultation_id) {
      qb.andWhere('attendance_details.medical_consultation_id = :medical_consultation_id', {
        medical_consultation_id: req_query.medical_consultation_id,
      });
    }

    if (req_query.query) {
      qb.andWhere(
        'CONCAT(attendance_details.anamnesis, attendance_details.physical_exam, attendance_details.heart_rate, attendance_details.respiratory_rate, attendance_details.temperature, attendance_details.pa, attendance_details.oxygen_saturation) LIKE :pattern',
        {
          pattern: `%${req_query.query}%`,
        },
      );
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(attendance_details.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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

  async findOne(id: number) {
    const attendanceDetail = await this.attendanceDetailsRepository.findOne({
      where: { id },
      relations: ['consultation_type', 'attendance_place', 'illness_quantity_type', 'medical_consultation'],
    });

    if (!attendanceDetail) return null;

    return attendanceDetail;
  }

  async create(createAttendanceDetailDto: CreateAttendanceDetailDto) {
    const newAttendanceDetail = await this.attendanceDetailsRepository.save({ ...createAttendanceDetailDto });

    if (!newAttendanceDetail) return null;

    return newAttendanceDetail.id;
  }

  async update(id: number, updateAttendanceDetailDto: UpdateAttendanceDetailDto) {
    const attendanceDetail = await this.attendanceDetailsRepository.findOneBy({ id });
    if (!attendanceDetail) return;

    attendanceDetail.date_updated = getSystemDatetime();
    const updatedAttendanceDetail = Object.assign(attendanceDetail, updateAttendanceDetailDto);
    await this.attendanceDetailsRepository.save(updatedAttendanceDetail);
  }

  async remove(id: number, forever: boolean = false) {
    const attendanceDetail = await this.attendanceDetailsRepository.findOneBy({ id });
    if (!attendanceDetail) return;

    if (forever) {
      await this.attendanceDetailsRepository.delete(id);
    } else {
      attendanceDetail.state = BaseEntityState.DELETED;
      attendanceDetail.date_deleted = getSystemDatetime();
      await this.attendanceDetailsRepository.save(attendanceDetail);
    }
  }

  async enable(id: number) {
    const attendanceDetail = await this.attendanceDetailsRepository.findOneBy({ id });
    if (!attendanceDetail) return;

    attendanceDetail.state = BaseEntityState.ENABLED;
    attendanceDetail.date_updated = getSystemDatetime();

    await this.attendanceDetailsRepository.save(attendanceDetail);
  }

  async disable(id: number) {
    const attendanceDetail = await this.attendanceDetailsRepository.findOneBy({ id });
    if (!attendanceDetail) return;

    attendanceDetail.state = BaseEntityState.DISABLED;
    attendanceDetail.date_updated = getSystemDatetime();

    await this.attendanceDetailsRepository.save(attendanceDetail);
  }
}
