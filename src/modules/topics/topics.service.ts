import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { RoleIds } from '../roles/entities/role.entity';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { ReqQuery, attendancePersonalStatusIds } from './dto/req_query.dto';
import { UserAssigment } from '../users/entities/user-assignment.entity';
import { MedicalCalendar } from '../medical-calendars/entities/medical-calendar.entity';
import { SettingNames } from '../settings/entities/setting.entity';
import { SettingsService } from '../settings/settings.service';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { MedicalCalendarDay } from '../medical-calendars/entities/medical-calendar-days.entity';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(UserAssigment) private userAssignmentsRepository: Repository<UserAssigment>,
    @InjectRepository(MedicalCalendar) private medicalCalendarsRepository: Repository<MedicalCalendar>,
    private readonly settingsService: SettingsService,
    @InjectRepository(Client) private clientRepository: Repository<Client>,
  ) {}

  async findAllTopicManagements(userId: number, isCentral: number) {
    const qb = this.clientRepository.createQueryBuilder('client');
    qb.select([
      'client.id client_id',
      'client.name client_name',
      'campus.id campus_id',
      'campus.name campus_name',
      'campus_condition.id campus_condition_id',
      'campus_condition.name campus_condition_name',
      'programmed_user.user_id user_id',
      'programmed_user.user_name user_name',
      'programmed_user.user_surname_first user_surname_first',
      'programmed_user.user_surname_second user_surname_second',
    ]);

    qb.innerJoin('client.campuses', 'campus');
    qb.innerJoin('campus.campus_condition', 'campus_condition');
    qb.leftJoin(
      subQuery => {
        return subQuery
          .select([
            'mc.campus_id campus_id',
            'us.id user_id',
            'us.name user_name',
            'us.surname_first user_surname_first',
            'us.surname_second user_surname_second',
          ])
          .from('medical_calendars', 'mc')
          .innerJoin('campus', 'cm', 'cm.id = mc.campus_id')
          .innerJoin('users', 'us', 'us.id = mc.user_id')
          .innerJoin('medical_calendar_days', 'mcd', 'mcd.medical_calendar_id = mc.id')
          .where('mcd.day = CAST(GETDATE() AS DATE)')
          .andWhere('us.state != :subUserState', { subUserState: BaseEntityState.DELETED })
          .andWhere('cm.state != :subCampusState', { subCampusState: BaseEntityState.DELETED });
      },
      'programmed_user',
      'programmed_user.campus_id = campus.id',
    );

    qb.where('client.state != :clientState', { clientState: BaseEntityState.DELETED });
    qb.andWhere('campus.state != :campusState', { campusState: BaseEntityState.DELETED });

    if (!isCentral) {
      qb.andWhere(qb => {
        const subQuery = qb
          .subQuery()
          .select(['ua.campus_id campus_id'])
          .from('user_assignments', 'ua')
          .where('ua.user_id = :userId', { userId })
          .andWhere('ua.state = :uaState', { uaState: BaseEntityState.ENABLED })
          .getQuery();
        return `campus.id IN ${subQuery}`;
      });
    }

    let items = await qb.getRawMany();

    const createProgrammedUser = (item) => {
      return {
        id: item.user_id,
        name: item.user_name,
        surname_first: item.user_surname_first,
        surname_second: item.user_surname_second,
      }
    }

    const createCampus = (item) => {
      return {
        id: item.campus_id,
        name: item.campus_name,
        condition: {
          id: item.campus_condition_id,
          name: item.campus_condition_name,
        },
        programmed_users: item.user_id
          ? [
              {
                id: item.user_id,
                name: item.user_name,
                surname_first: item.user_surname_first,
                surname_second: item.user_surname_second,
              },
            ]
          : [],
      }
    }

    items = items.reduce((acc: any[], item) => {
      const indexFound = acc.findIndex(i => i.id === item.client_id);

      if (indexFound === -1) {
        acc.push({
          id: item.client_id,
          name: item.client_name,
          campuses: [
            createCampus(item),
          ],
        });
      } else {
        const campusIndexFound = acc[indexFound].campuses.findIndex(i => i.id === item.campus_id);

        if (campusIndexFound === -1) {
          acc[indexFound].campuses.push(createCampus(item));

        } else {
          acc[indexFound].campuses[campusIndexFound].programmed_users.push(createProgrammedUser(item));
        }
      }

      return acc;
    }, []);

    return items;
  }

  async findAllSannaTeams(
    req_query: ReqQuery,
    userId: number,
    isCentral: number,
  ): Promise<PaginatedResult<UserAssigment>> {
    const skip = req_query.limit * req_query.page;
    const setting = await this.settingsService.findOneByName(SettingNames.TOPICS_ATTENDANCE_TOLERANTE);
    const toleranceTime = parseInt(setting.value);

    let campusIds = [];
    if (!isCentral) {
      campusIds = await this.findAllCampuses(userId);
      if (!campusIds) return null;
    }

    let qb = this.usersRepository.createQueryBuilder('users');
    qb.select(['users.id', 'users.name', 'users.surname_first', 'users.surname_second']);

    qb.innerJoin(
      'users.medical_calendars',
      'medical_calendars',
      'medical_calendars.month = MONTH(GETDATE()) AND medical_calendars.year = YEAR(GETDATE())',
    );
    qb.addSelect([
      'medical_calendars.id',
      'medical_calendars.user_id',
      'medical_calendars.campus_id',
      'medical_calendars.month',
      'medical_calendars.year',
    ]);

    if (req_query.campus_id) {
      qb.innerJoin('medical_calendars.campus', 'campus', 'campus.id = :campusId', {
        campusId: req_query.campus_id,
      });
    } else {
      qb.innerJoin('medical_calendars.campus', 'campus');
    }
    qb.addSelect(['campus.id', 'campus.name', 'campus.client_id']);

    if (req_query.client_id) {
      qb.innerJoin('campus.client', 'client', 'client.id = :clientId', { clientId: req_query.client_id });
    } else {
      qb.innerJoin('campus.client', 'client');
    }
    qb.addSelect(['client.id', 'client.name']);

    qb.innerJoin('medical_calendars.days', 'days', 'days.day = CAST(GETDATE() AS DATE)')
      .addSelect(subQuery => {
        return subQuery
          .select('MAX(mcd.day)', 'maxDay')
          .from(MedicalCalendarDay, 'mcd')
          .where('mcd.medical_calendar_id = medical_calendars.id');
      }, 'maxDay')
      .addSelect(subQuery => {
        return subQuery
          .select('MIN(mcd.day)', 'minDay')
          .from(MedicalCalendarDay, 'mcd')
          .where('mcd.medical_calendar_id = medical_calendars.id');
      }, 'minDay');

    qb.leftJoin('users.attendance_records', 'attendance_records', 'attendance_records.day = CAST(GETDATE() AS DATE)');
    qb.addSelect([
      'attendance_records.id',
      'attendance_records.day',
      // 'attendance_records.entry_time',
      // 'attendance_records.leaving_time',
      'attendance_records.user_id',
      'attendance_records.campus_id',
    ]);
    qb.addSelect("CONVERT(VARCHAR(10), attendance_records.entry_time)", 'attendance_records_entry_time')
    qb.addSelect("CONVERT(VARCHAR(10), attendance_records.leaving_time)", 'attendance_records_leaving_time')

    qb.addSelect(
      `
      CASE
      WHEN attendance_records.id IS NOT NULL THEN
      CASE
      WHEN DATEDIFF(MINUTE, attendance_records.entry_time, days.entry_time) + :toleranceTime < 0 THEN ${attendancePersonalStatusIds.ATTENDING}
      WHEN DATEDIFF(MINUTE, attendance_records.entry_time, days.entry_time) + :toleranceTime >= 0 AND attendance_records.leaving_time IS NULL THEN ${attendancePersonalStatusIds.ATTENDING}
      WHEN DATEDIFF(MINUTE, attendance_records.entry_time, days.entry_time) + :toleranceTime >= 0 AND attendance_records.leaving_time IS NOT NULL THEN ${attendancePersonalStatusIds.PROGRAMMED}
      END
      ELSE
      CASE
      WHEN DATEDIFF(MINUTE, GETDATE(), days.entry_time) + :toleranceTime >= 0 THEN ${attendancePersonalStatusIds.PROGRAMMED}
      WHEN DATEDIFF(MINUTE, GETDATE(), days.entry_time) + :toleranceTime < 0 THEN ${attendancePersonalStatusIds.MISSING}
      END
      END
      `,
      'sanna_team_status',
    ).setParameter('toleranceTime', toleranceTime);

    qb.where('users.state != :state', { state: BaseEntityState.DELETED });
    qb.andWhere('users.role_id = :role_id', { role_id: RoleIds.HEALTH_TEAM });
    if (!isCentral) {
      qb.andWhere('medical_calendars.campus_id IN (:...campusIds)', { campusIds });
    }

    qb.orderBy(req_query.order_col, req_query.order_dir);
    qb.skip(skip);
    qb.take(req_query.limit);

    const result = await qb.getRawAndEntities();
    let items = result.raw;
    if (req_query.status_id) {
      items = items.filter(item => item.sanna_team_status == req_query.status_id);
    }

    const total = items.length;

    return {
      total,
      items,
      limit: req_query.limit,
      page: req_query.page,
    };
  }

  async findAllCalendars(req_query: ReqQuery, userId: number, isCentral: number) {
    // const setting = await this.settingsService.findOneByName(SettingNames.TOPICS_ATTENDANCE_TOLERANTE);
    // const toleranceTime = parseInt(setting.value);

    let campusIds = [];
    if (!isCentral) {
      campusIds = await this.findAllCampuses(userId);
      if (!campusIds) return null;
    }

    let qb = this.medicalCalendarsRepository.createQueryBuilder('medical_calendars');
    qb.select([
      'medical_calendars.id',
      'medical_calendars.user_id',
      'medical_calendars.campus_id',
      'medical_calendars.month',
      'medical_calendars.year',
      'medical_calendars.total_hours',
    ]);
    qb.innerJoin('medical_calendars.days', 'days');
    qb.addSelect(['days.id', 'days.medical_calendar_id', 'days.day', 'days.entry_time', 'days.leaving_time']);

    qb.innerJoin('medical_calendars.user', 'user', 'user.state != :state', { state: BaseEntityState.DELETED });
    qb.addSelect(['user.id', 'user.name', 'user.surname_first', 'user.surname_second', 'user.email']);
    qb.leftJoin('medical_calendars.campus', 'campus');
    qb.leftJoin('campus.client', 'client');

    if (!isCentral) {
      qb.where('medical_calendars.campus_id IN (:...campusIds)', { campusIds });
    }

    if (req_query.month && req_query.year) {
      qb.andWhere('medical_calendars.month = :month', { month: req_query.month });
      qb.andWhere('medical_calendars.year = :year', { year: req_query.year });
    } else {
      qb.andWhere('medical_calendars.month = MONTH(GETDATE())');
      qb.andWhere('medical_calendars.year = YEAR(GETDATE())');
    }

    if (req_query.campus_id && req_query.client_id) {
      qb.andWhere('campus.id = :campusId', { campusId: req_query.campus_id });
      qb.andWhere('client.id = :clientId', { clientId: req_query.client_id });
    }

    const items = await qb.getMany();

    return items;
  }

  private async findAllCampuses(userId: number): Promise<Number[]> {
    let qb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.user_assignments', 'user_assignments')
      .where('user.id = :id', { id: userId })
      .andWhere('user_assignments.state != :state', { state: BaseEntityState.DELETED })
      .andWhere('user.state != :state', { state: BaseEntityState.DELETED });

    const item = await qb.getOne();

    if (!item) return null;

    const campusIds = item.user_assignments.map(assignment => assignment.campus_id);
    return campusIds;
  }

  private async findAllAssignmentsByClient(userId: number): Promise<UserAssigment[]> | null {
    let qb = this.userAssignmentsRepository.createQueryBuilder('user_assignments');
    qb.leftJoin('user_assignments.campus', 'campus');
    qb.addSelect(['campus.id', 'campus.name']);

    qb.leftJoin('campus.client', 'client');
    qb.addSelect(['client.id', 'client.name']);

    qb.where('user_assignments.user_id = :userId', { userId });
    qb.andWhere('user_assignments.state != :state', { state: BaseEntityState.DELETED });

    const items = await qb.getMany();
    if (!items.length) return null;

    return items;
  }
}
