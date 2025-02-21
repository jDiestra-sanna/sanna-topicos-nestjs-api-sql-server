import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, Repository } from 'typeorm';
import { getSystemDatetime } from 'src/common/helpers/date';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { User } from '../users/entities/user.entity';
import { ReqQuery, ReqQueryExport, ReqQueryForm } from './dto/req-query.dto';
import { Group } from '../groups/entities/group.entity';
import { Client } from '../clients/entities/client.entity';
import { Campus } from '../campus/entities/campus.entity';
import { RoleIds } from '../roles/entities/role.entity';
import { NewMedicalCalendarDto } from './dto/create-medical-calendar.dto';
import { MedicalCalendar } from './entities/medical-calendar.entity';
import { MedicalCalendarDay } from './entities/medical-calendar-days.entity';
import { MedicalCalendarUpdateDto } from './dto/update-medical-calendar.dto';
import { CampusService } from '../campus/campus.service';
import { Proffesion } from '../proffesions/entities/proffesion.entity';
import { ReqQueryCampusList } from './dto/req-query-programmed-campuses.dto';

@Injectable()
export class MedicalCalendarsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(MedicalCalendar)
    private medicalCalendarsRepository: Repository<MedicalCalendar>,
    @InjectRepository(MedicalCalendarDay)
    private medicalCalendarDaysRepository: Repository<MedicalCalendarDay>,
    private campusService: CampusService,
    private readonly entityManager: EntityManager,
  ) {}

  async findAll(query: ReqQuery): Promise<PaginatedResult<User>> {
    const skip = query.limit * query.page;
    let qb = this.usersRepository.createQueryBuilder('user');

    qb.select([
      'user.id id',
      'user.state state',
      'user.name name',
      'user.surname_first surname_first',
      'user.surname_second surname_second',
      'user.document_number document_number',
      'user.is_central is_central',
      'user.colegiatura colegiatura',
      'user.email email',
      'user.phone phone',
      'user.role_id role_id',
      'document_type.id document_type_id',
      'document_type.name document_type_name'
    ]);
    qb.addSelect("CASE WHEN medical_calendars.programmed IS NULL THEN 0 ELSE 1 END", 'programmed');
    qb.leftJoin('user.document_type', 'document_type');
    qb.leftJoin(subQuery => {
      return subQuery
        .select("mc.user_id", "user_id")
        // .addSelect("IF(COUNT(mc.id) > 0, 1, 0)", "programmed")
        .addSelect("CASE WHEN COUNT(mc.id) > 0 THEN 1 ELSE 0 END", 'programmed')
        .from("medical_calendars", "mc")
        .where("mc.year = YEAR(GETDATE())")
        .andWhere("mc.month = MONTH(GETDATE())")
        .andWhere("mc.campus_id = :campusId", { campusId: query.campus_id })
        .groupBy("mc.user_id");
    }, 'medical_calendars', 'medical_calendars.user_id = user.id');
    qb.leftJoin('user.user_assignments', 'user_assignments');
    qb.leftJoin('user_assignments.campus', 'campus');
    qb.leftJoin('campus.client', 'client');
    qb.leftJoin('client.group', 'group');
    qb.where('user.state != :state', { state: BaseEntityState.DELETED });
    qb.andWhere('user.role_id = :roleId', { roleId: RoleIds.HEALTH_TEAM });

    if (query.query) {
      qb.andWhere(
        'CONCAT(user.name, user.surname, user.surname_first, user.surname_second, user.email, user.document_number, user.phone) LIKE :pattern',
        {
          pattern: `%${query.query}%`,
        },
      );
    }

    if (query.date_from && query.date_to) {
      qb.andWhere('CAST(user.date_created AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: query.date_from,
        date_to: query.date_to,
      });
    }

    qb.andWhere(
      new Brackets(_qb => {
        _qb.where(
          new Brackets(__qb => {
            __qb.where('user_assignments.state != :state', { state: BaseEntityState.DELETED });

            if (query.group_id > 0) {
              __qb.andWhere('group.id = :groupId', { groupId: query.group_id });
            }

            if (query.client_id > 0) {
              __qb.andWhere('client.id = :clientId', { clientId: query.client_id });
            }

            if (query.campus_id > 0) {
              __qb.andWhere('campus.id = :campusId', { campusId: query.campus_id });
            }
          }),
        );
        _qb.orWhere('user.is_central = :isCentral', { isCentral: 1 });
      }),
    );

    const total = await qb.getCount();

    qb.distinct(true);
    qb.offset(skip);
    qb.limit(query.limit);
    qb.orderBy(query.order_col, query.order_dir);

    let items = await qb.getRawMany();

    items = items.map(item => ({
      ...item,
      document_type: {
        id: item.document_type_id,
        name: item.document_type_name,
      },
    }));

    return {
      total,
      items,
      limit: query.limit,
      page: query.page,
    };
  }

  async findOne(id: number): Promise<MedicalCalendar | null> {
    let qb = this.medicalCalendarsRepository.createQueryBuilder('mc');
    qb.innerJoinAndMapMany('mc.days', MedicalCalendarDay, 'mcd', 'mcd.medical_calendar_id = mc.id');
    qb.where('mc.id = :id', { id });

    return await qb.getOne();
  }

  async findOneByDay(day: string, user_id: number) {
    let qb = this.medicalCalendarsRepository.createQueryBuilder('mc');
    qb.innerJoinAndMapMany('mc.days', MedicalCalendarDay, 'mcd', 'mcd.medical_calendar_id = mc.id');
    qb.innerJoinAndMapOne('mc.campus', Campus, 'campus', 'campus.id = mc.campus_id');
    qb.innerJoinAndMapOne('campus.client', Client, 'client', 'client.id = campus.client_id');
    qb.leftJoinAndMapOne('client.group', Group, 'group', 'group.id = client.group_id');
    qb.where('mc.user_id = :user_id', { user_id });
    qb.andWhere('mcd.day = :day', { day });

    return await qb.getOne();
  }

  async findOneForm(query: ReqQueryForm) {
    const campus = await this.campusService.findOne(query.campus_id);
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndMapOne('user.proffesion', Proffesion, 'proffesion', 'proffesion.id = user.proffesion_id')
      .where('user.id = :id', { id: query.user_id })
      .select([
        'user.id',
        'user.name',
        'user.surname_first',
        'user.surname_second',
        'user.phone',
        'user.email',
        'user.role_id',
        'proffesion.id',
        'proffesion.name',
      ])
      .getOne();

    let qb = this.medicalCalendarsRepository.createQueryBuilder('mc');
    qb.innerJoinAndMapMany('mc.days', MedicalCalendarDay, 'mcd', 'mcd.medical_calendar_id = mc.id');
    qb.where('mc.user_id = :userId', { userId: query.user_id });
    qb.andWhere('mc.campus_id = :campusId', { campusId: query.campus_id });
    qb.andWhere('mc.month = :month', { month: query.month });
    qb.andWhere('mc.year = :year', { year: query.year });

    const medical_calendar = await qb.getOne();
    const campusBusyDays = await this.getCampusBusyDays(query.campus_id, query.user_id);
    const userBusyDays = await this.getUserBusyDays(query.user_id, query.campus_id);

    let busy_days = [...campusBusyDays, ...userBusyDays];
    busy_days = Array.from(new Set(busy_days));

    return {
      medical_calendar,
      campus,
      user,
      busy_days,
    };
  }

  async create(newMedicalCalendarDto: NewMedicalCalendarDto): Promise<MedicalCalendar> | null {
    let { days, ...result } = newMedicalCalendarDto;

    return await this.entityManager.transaction(async transactionalEntityManager => {
      const newMedicalCalendar = await transactionalEntityManager.save(MedicalCalendar, result);

      days = days.map(day => ({ ...day, medical_calendar_id: newMedicalCalendar.id }));

      await transactionalEntityManager.createQueryBuilder().insert().into(MedicalCalendarDay).values(days).execute();
      return newMedicalCalendar;
    });
  }

  async update(id: number, medicalCalendarUpdateDto: MedicalCalendarUpdateDto) {
    let { days, ...result } = medicalCalendarUpdateDto;

    const medicalCalendar = await this.medicalCalendarsRepository.findOneBy({ id });
    if (!medicalCalendar) return;

    medicalCalendar.date_updated = getSystemDatetime();

    const updatedPost = Object.assign(medicalCalendar, result);

    return await this.entityManager.transaction(async transacionalEntityManager => {
      await transacionalEntityManager.save(MedicalCalendar, updatedPost);

      await transacionalEntityManager.delete(MedicalCalendarDay, { medical_calendar_id: medicalCalendar.id });

      days = days.map(day => ({ ...day, medical_calendar_id: medicalCalendar.id }));
      await transacionalEntityManager.createQueryBuilder().insert().into(MedicalCalendarDay).values(days).execute();
    });
  }

  async isScheduled(userId: number) {
    return await this.medicalCalendarsRepository
      .createQueryBuilder('mc')
      .innerJoin('mc.campus', 'cps')
      .where('mc.user_id = :userId', { userId })
      .andWhere('mc.month = MONTH(GETDATE())')
      .andWhere('mc.year = YEAR(GETDATE())')
      .andWhere('cps.state = :state', { state: BaseEntityState.ENABLED })
      .getExists();
  }

  async scheduledCampuses(userId: number): Promise<MedicalCalendar[]> {
    return await this.medicalCalendarsRepository
      .createQueryBuilder('mc')
      .innerJoin('mc.campus', 'cps')
      .where('user_id = :userId', { userId })
      .andWhere('month = MONTH(GETDATE())')
      .andWhere('year = YEAR(GETDATE())')
      .andWhere('cps.state = :state', { state: BaseEntityState.ENABLED })
      .select(['mc.id', 'mc.month', 'mc.year', 'mc.total_hours', 'cps.id', 'cps.name', 'cps.address'])
      .getMany();
  }

  async scheduledCampusesPaginated(query: ReqQueryCampusList): Promise<PaginatedResult<MedicalCalendar>> {
    const skip = query.limit * query.page;
    let qb = this.medicalCalendarsRepository
      .createQueryBuilder('mc')
      .innerJoin('mc.campus', 'cps')
      .innerJoin('cps.client', 'cl')
      .leftJoin('cl.group', 'gr')
      .where('user_id = :userId', { userId: query.user_id })
      .andWhere('month = MONTH(GETDATE())')
      .andWhere('year = YEAR(GETDATE())')
      .andWhere('cps.state = :state', { state: BaseEntityState.ENABLED })
      .select(['mc.id', 'cps.id', 'cps.name'])
      .addSelect(['cl.id', 'cl.name', 'gr.id', 'gr.name']);
    const total = await qb.getCount();
    qb.skip(skip);
    qb.take(query.limit);
    qb.orderBy(query.order_col, query.order_dir);
    const items = await qb.getMany();

    return {
      total,
      items,
      limit: query.limit,
      page: query.page,
    };
  }

  async isLate(userId: number, day: string, time: string, tolerance = '00:05:00') {
    let qb = this.medicalCalendarsRepository.createQueryBuilder('mc');
    qb.innerJoin(MedicalCalendarDay, 'mcd', 'mcd.medical_calendar_id = mc.id');
    qb.where('mc.user_id = :userId', { userId });
    qb.andWhere('mcd.day = :day', { day });
    qb.andWhere(`ADDTIME(mcd.entry_time, '${tolerance}') >= :time`, { time });

    return !(await qb.getExists());
  }

  async isInWorkHours(userId: number, day: string, time: string) {
    let qb = this.medicalCalendarsRepository.createQueryBuilder('mc');
    qb.innerJoin(MedicalCalendarDay, 'mcd', 'mcd.medical_calendar_id = mc.id');
    qb.where('mc.user_id = :userId', { userId });
    qb.andWhere('mcd.day = :day', { day });
    qb.andWhere(`'${time}' between mc.entry_time and mc.leaving_time`);

    return await qb.getExists();
  }

  async isLeavingTime(userId: number, day: string, time: string) {
    let qb = this.medicalCalendarsRepository.createQueryBuilder('mc');
    qb.innerJoin(MedicalCalendarDay, 'mcd', 'mcd.medical_calendar_id = mc.id');
    qb.where('mc.user_id = :userId', { userId });
    qb.andWhere('mcd.day = :day', { day });
    qb.andWhere('mc.leaving_time <= :time', { time });

    return await qb.getExists();
  }

  async getCampusBusyDays(campusId: number, excludeUserId: number = 0): Promise<object[]> {
    let qb = this.medicalCalendarsRepository.createQueryBuilder('mc');
    qb.innerJoinAndMapMany('mc.days', MedicalCalendarDay, 'mcd', 'mcd.medical_calendar_id = mc.id');
    qb.where('mc.campus_id = :campusId', { campusId });

    if (excludeUserId) {
      qb.andWhere('mc.user_id != :excludeUserId', { excludeUserId });
    }

    qb.select([
      'mcd.day day',
      'mcd.entry_time entry_time',
      'mcd.leaving_time leaving_time',
      'mcd.hours_per_day hours_per_day',
    ]);

    const items = await qb.getRawMany();
    return items.map(day => ({
      day: day.day,
      entry_time: day.entry_time,
      leaving_time: day.leaving_time,
      hours_per_day: day.hours_per_day,
    }));
  }

  async getUserBusyDays(userId: number, excludeCampusId: number = 0): Promise<object[]> {
    let qb = this.medicalCalendarsRepository.createQueryBuilder('mc');
    qb.innerJoinAndMapMany('mc.days', MedicalCalendarDay, 'mcd', 'mcd.medical_calendar_id = mc.id');
    qb.where('mc.user_id = :userId', { userId });

    if (excludeCampusId) {
      qb.andWhere('mc.campus_id != :excludeCampusId', { excludeCampusId });
    }

    qb.select([
      'mcd.day day',
      'mcd.entry_time entry_time',
      'mcd.leaving_time leaving_time',
      'mcd.hours_per_day hours_per_day',
    ]);

    const items = await qb.getRawMany();
    return items.map(day => ({
      day: day.day,
      entry_time: day.entry_time,
      leaving_time: day.leaving_time,
      hours_per_day: day.hours_per_day,
    }));
  }

  async exportAll(query: ReqQueryExport): Promise<MedicalCalendar[]> {
    let qb = this.medicalCalendarsRepository
      .createQueryBuilder('mc')
      .innerJoin('mc.days', 'mcd')
      .innerJoin('mc.user', 'user')
      .innerJoin('mc.campus', 'campus')
      .where('mc.campus_id = :campusId', { campusId: query.campus_id })
      .andWhere('mc.month = MONTH(GETDATE())')
      .andWhere('mc.year = YEAR(GETDATE())');

    if (query.query) {
      qb.andWhere(
        'CONCAT(user.name, user.surname, user.surname_first, user.surname_second, user.email, user.document_number, user.phone) LIKE :pattern',
        {
          pattern: `%${query.query}%`,
        },
      );
    }

    qb.select(['mc.id', 'campus.name', 'mcd.day']);
    qb.addSelect('CONVERT(VARCHAR(10), mcd.entry_time, 108)', 'mcd_entry_time');
    qb.addSelect('CONVERT(VARCHAR(10), mcd.leaving_time, 108)', 'mcd_leaving_time')
    qb.addSelect("CONCAT(user.name, ' ', user.surname_first, ' ', user.surname_second)", 'user_name');

    const results = await qb.getRawMany();  

    return results;
  }

  async exportOneForm(query: ReqQueryForm): Promise<MedicalCalendar[]> {
    return await this.medicalCalendarsRepository
      .createQueryBuilder('mc')
      .innerJoin('mc.days', 'mcd')
      .innerJoin('mc.user', 'user')
      .innerJoin('mc.campus', 'campus')
      .where('mc.user_id = :userId', { userId: query.user_id })
      .andWhere('mc.campus_id = :campusId', { campusId: query.campus_id })
      .andWhere('mc.month = :month', { month: query.month })
      .andWhere('mc.year = :year', { year: query.year })
      .select(['mc.id', 'campus.name', 'mcd.day'])
      .addSelect("CONVERT(VARCHAR(10), mcd.entry_time)", 'mcd_entry_time')
      .addSelect("CONVERT(VARCHAR(10), mcd.leaving_time)", 'mcd_leaving_time')
      .addSelect("CONCAT(user.name, ' ', user.surname_first, ' ', user.surname_second)", 'user_name')
      .getRawMany();
  }

  async deleteDays(id: number, dayIds: number[]) {
    return await this.medicalCalendarDaysRepository
      .createQueryBuilder()
      .delete()
      .from(MedicalCalendarDay)
      .where('medical_calendar_id = :id', { id })
      .andWhereInIds(dayIds)
      .execute();
  }

  async medicalCalendarExists(id: number): Promise<boolean> {
    return await this.medicalCalendarsRepository
      .createQueryBuilder('medical_calendar')
      .where('id = :id', { id })
      .getExists();
  }
}
