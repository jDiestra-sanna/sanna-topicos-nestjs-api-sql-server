import { BaseEntityState } from 'src/common/entities/base.entity';
import { CampusService } from '../campus/campus.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { getSystemDate, getSystemDatetime } from 'src/common/helpers/date';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalCalendarsService } from '../medical-calendars/medical-calendars.service';
import { Notification, NotificationState } from './entities/notification.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Repository } from 'typeorm';
import { ReqQuery } from './dto/req-query.dto';
import { ReqQuery as ReqQueryUser } from '../users/dto/req-query.dto';
import { RoleIds } from '../roles/entities/role.entity';
import { UserAssignmentsService } from '../users/user-assignments.service';
import { UsersService } from '../users/users.service';
import { LogsService } from '../logs/logs.service';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogTargetsIds } from '../logs/entities/log-target';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private readonly campusService: CampusService,
    private readonly medicalCalendarsService: MedicalCalendarsService,
    private readonly userAssignmentsService: UserAssignmentsService,
    private readonly usersService: UsersService,
    private readonly logsService: LogsService,
  ) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<Notification>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.notificationsRepository.createQueryBuilder('notification');

    qb.where('notification.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.user_id) {
      qb.andWhere('notification.user_id = :user_id', { user_id: req_query.user_id });
    }

    if (req_query.query) {
      qb.andWhere('CONCAT(notification.title) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(notification.date_created DATE) BETWEEN :date_from AND :date_to', {
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

  async findOne(id: number): Promise<Notification> {
    return await this.notificationsRepository.findOneBy({ id });
  }

  async create(createNotificationDto: CreateNotificationDto): Promise<number> {
    const newNotification = await this.notificationsRepository.save(createNotificationDto);
    return newNotification.id;
  }

  async createMany(notifications: CreateNotificationDto[]) {
    return await this.notificationsRepository
      .createQueryBuilder()
      .insert()
      .into(Notification)
      .values(notifications)
      .execute();
  }

  async reportEmergency(userId: number) {
    const currentMedicalCalendar = await this.medicalCalendarsService.findOneByDay(getSystemDate(), userId);
    if (!currentMedicalCalendar) throw new NotFoundException('Usuario no cuenta con programacion medica para hoy');

    const campus = await this.campusService.findOne(currentMedicalCalendar.campus_id);
    const clients = await this.userAssignmentsService.findUsersByCampus(
      currentMedicalCalendar.campus_id,
      RoleIds.CLIENT,
    );
    const admins = await this.usersService.findAll({ ...new ReqQueryUser(), role_id: RoleIds.Admin, limit: 1000 });
    const users = [...clients, ...admins.items];

    const notifications: CreateNotificationDto[] = users.map(user => ({
      user_id: user.id,
      title: 'Emergencia',
      body: `Hay una emergencia en la sede \"${campus.name}\" del cliente \"${campus.client.name}\"`,
    }));

    await this.createMany(notifications);

    await this.logsService.create({
      log_type_id: LogTypesIds.REPORT_EMERGENCY,
      user_id: userId,
      target_row_id: campus.id,
      target_row_label: campus.name,
      log_target_id: LogTargetsIds.CAMPUS,
    });
  }

  async markAsRead(ids: number[]) {
    return await this.notificationsRepository
      .createQueryBuilder()
      .update({ state: NotificationState.READED })
      .whereInIds(ids)
      .execute();
  }

  async remove(id: number, forever: boolean = false) {
    const notification = await this.notificationsRepository.findOneBy({ id });
    if (!notification) return;

    if (forever) {
      await this.notificationsRepository.delete(id);
    } else {
      notification.state = NotificationState.DELETED;
      notification.date_deleted = getSystemDatetime();

      await this.notificationsRepository.save(notification);
    }
  }

  async enable(id: number) {
    const notification = await this.notificationsRepository.findOneBy({ id });
    if (!notification) return;

    notification.state = NotificationState.ENABLED;
    notification.date_updated = getSystemDatetime();

    await this.notificationsRepository.save(notification);
  }

  async disable(id: number) {
    const notification = await this.notificationsRepository.findOneBy({ id });
    if (!notification) return;

    notification.state = NotificationState.DISABLED;
    notification.date_updated = getSystemDatetime();

    await this.notificationsRepository.save(notification);
  }
}
