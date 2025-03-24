import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { getSystemDatetime } from 'src/common/helpers/date';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { ReqQuery } from './dto/req-query.dto';
import { Campus } from './entities/campus.entity';
import { UbigeoPeruDeparment } from '../ubigeo/entities/departments.entity';
import { UbigeoPeruProvince } from '../ubigeo/entities/province.entity';
import { UbigeoPeruDistrict } from '../ubigeo/entities/district.entity';
import { CreateCampusDto } from './dto/create-campus.dto';
import { ClientsService } from '../clients/clients.service';
import { Client } from '../clients/entities/client.entity';
import { Group } from '../groups/entities/group.entity';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { SettingsService } from '../settings/settings.service';
import { Setting, SettingNames } from '../settings/entities/setting.entity';
import { SettingCorrelatives } from '../settings/correlatives.interface';
import { ClientLevelIds } from '../client-levels/entities/client-level.entity';
import CampusSchedulesService from '../campus-schedules/campus-schedules.service';
import { CampusSchedule } from '../campus-schedules/entities/campus-schedule.entity';

@Injectable()
export class CampusService {
  constructor(
    @InjectRepository(Campus)
    private campusRepository: Repository<Campus>,
    private clientsService: ClientsService,
    private settingsService: SettingsService,
    private campusSchedulesService: CampusSchedulesService,
    private readonly entityManager: EntityManager,
  ) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<Campus>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.campusRepository.createQueryBuilder('campus');

    qb.where('campus.state != :state', { state: BaseEntityState.DELETED });
    qb.leftJoinAndMapOne(
      'campus.ubigeo_peru_department',
      UbigeoPeruDeparment,
      'department',
      'department.id = campus.ubigeo_peru_department_id',
    );
    qb.leftJoinAndMapOne(
      'campus.ubigeo_peru_province',
      UbigeoPeruProvince,
      'province',
      'province.id = campus.ubigeo_peru_province_id',
    );
    qb.leftJoinAndMapOne(
      'campus.ubigeo_peru_district',
      UbigeoPeruDistrict,
      'district',
      'district.id = campus.ubigeo_peru_district_id',
    );
    qb.leftJoinAndMapOne('campus.client', Client, 'client', 'client.id = campus.client_id');
    qb.leftJoinAndMapOne('client.group', Group, 'group', 'group.id = client.group_id');

    qb.leftJoin('campus.campus_schedule', 'campus_schedule', 'campus_schedule.state != :_state', {
      _state: BaseEntityState.DELETED,
    });
    qb.addSelect([
      'campus_schedule.id',
      'campus_schedule.state',
      'campus_schedule.campus_id',
      'campus_schedule.day_id',
      'campus_schedule.opening_time',
      'campus_schedule.closing_time',
    ]);

    if (req_query.query) {
      qb.andWhere('CONCAT(campus.name, campus.contact, campus.correlative) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.ubigeo_peru_department_id) {
      qb.andWhere('campus.ubigeo_peru_department_id = :department_id', {
        department_id: req_query.ubigeo_peru_department_id,
      });
    }

    if (req_query.ubigeo_peru_province_id) {
      qb.andWhere('campus.ubigeo_peru_province_id = :province_id', { province_id: req_query.ubigeo_peru_province_id });
    }

    if (req_query.ubigeo_peru_district_id) {
      qb.andWhere('campus.ubigeo_peru_district_id = :district_id', { district_id: req_query.ubigeo_peru_district_id });
    }

    if (req_query.client_id) {
      qb.andWhere('campus.client_id = :client_id', { client_id: req_query.client_id });
    }

    if (req_query.group_id) {
      qb.andWhere('campus.group_id = :group_id', { group_id: req_query.group_id });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(campus.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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

  async findOne(id: number): Promise<Campus> {
    let qb = this.campusRepository.createQueryBuilder('campus');

    qb.where('campus.state != :state', { state: BaseEntityState.DELETED });
    qb.leftJoinAndMapOne(
      'campus.ubigeo_peru_department',
      UbigeoPeruDeparment,
      'department',
      'department.id = campus.ubigeo_peru_department_id',
    );
    qb.leftJoinAndMapOne(
      'campus.ubigeo_peru_province',
      UbigeoPeruProvince,
      'province',
      'province.id = campus.ubigeo_peru_province_id',
    );
    qb.leftJoinAndMapOne(
      'campus.ubigeo_peru_district',
      UbigeoPeruDistrict,
      'district',
      'district.id = campus.ubigeo_peru_district_id',
    );
    qb.leftJoinAndMapOne('campus.client', Client, 'client', 'client.id = campus.client_id');
    qb.leftJoinAndMapOne('client.group', Group, 'group', 'group.id = client.group_id');
    qb.leftJoin('campus.campus_schedule', 'campus_schedule', 'campus_schedule.state != :_state', {
      _state: BaseEntityState.DELETED,
    });
    qb.addSelect([
      'campus_schedule.id',
      'campus_schedule.state',
      'campus_schedule.campus_id',
      'campus_schedule.day_id',
      'campus_schedule.opening_time',
      'campus_schedule.closing_time',
    ]);
    qb.leftJoin('campus.campus_condition', 'campus_condition')
    qb.addSelect(['campus_condition.id', 'campus_condition.name'])
    qb.where('campus.id = :id', { id });

    return await qb.getOne();
  }

  async create(createCampusDto: CreateCampusDto): Promise<Campus> {
    const setting = await this.settingsService.findOneByName(SettingNames.CORRELATIVES);
    const client = await this.clientsService.findOne(createCampusDto.client_id);

    if (!setting) {
      throw new InternalServerErrorException('Configuracion de correlativos no existe');
    }

    const settingCorrelatives: SettingCorrelatives = JSON.parse(setting.value);
    let nextCorrelative = settingCorrelatives.campus[client.correlative];

    if (nextCorrelative) {
      nextCorrelative++;
    } else {
      nextCorrelative = 1;
    }
    let { schedules } = createCampusDto;
    delete createCampusDto.schedules;

    return await this.entityManager.transaction(async transactionalEntityManager => {
      const newCampus = await transactionalEntityManager.save(Campus, {
        ...createCampusDto,
        correlative: `${client.correlative}${nextCorrelative.toString().padStart(2, '0')}`,
      });

      if (schedules) {
        schedules = schedules.map(schedule => ({
          ...schedule,
          campus_id: newCampus.id,
        }));

        await transactionalEntityManager.createQueryBuilder().insert().into(CampusSchedule).values(schedules).execute();
      }

      settingCorrelatives.campus[client.correlative] = nextCorrelative;
      setting.value = JSON.stringify(settingCorrelatives);

      await transactionalEntityManager.save(Setting, setting);
      return newCampus;
    });
  }

  async update(id: number, updateCampusDto: UpdateCampusDto) {
    const campus = await this.campusRepository.findOneBy({ id });

    if (!campus) return;

    campus.date_updated = getSystemDatetime();
    let { schedules } = updateCampusDto;
    delete updateCampusDto.schedules;

    await this.entityManager.transaction(async transactionalEntityManager => {
      const updatedPost = Object.assign(campus, updateCampusDto);
      await transactionalEntityManager.save(Campus, updatedPost);

      if (schedules) {
        schedules = schedules.map(schedule => ({
          ...schedule,
          campus_id: campus.id,
        }));

        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(CampusSchedule)
          .where('campus_id = :id', { id })
          .execute();

        await transactionalEntityManager.createQueryBuilder().insert().into(CampusSchedule).values(schedules).execute();
      }
    });
  }

  async remove(id: number, forever: boolean = false) {
    const campus = await this.campusRepository.findOneBy({ id });

    if (!campus) return;

    if (forever) {
      await this.campusRepository.delete(id);
    } else {
      campus.state = BaseEntityState.DELETED;
      campus.date_deleted = getSystemDatetime();

      await this.campusRepository.save(campus);
    }
  }

  async enable(id: number) {
    const campus = await this.campusRepository.findOneBy({ id });

    if (!campus) return;

    campus.state = BaseEntityState.ENABLED;
    campus.date_updated = getSystemDatetime();

    await this.campusRepository.save(campus);
  }

  async disable(id: number) {
    const campus = await this.campusRepository.findOneBy({ id });

    if (!campus) return;

    campus.state = BaseEntityState.DISABLED;
    campus.date_updated = getSystemDatetime();

    await this.campusRepository.save(campus);
  }

  async findCampusesIdsByOrgEntity(clientLevelId: number, orgEntityId: number) {
    let campusIds = [];
    if (clientLevelId === ClientLevelIds.GROUP) {
      campusIds = await this.findAllCampusesBelongToGroup(orgEntityId);
    }
    if (clientLevelId === ClientLevelIds.CLIENT) {
      campusIds = await this.findAllCampusesBelongToClient(orgEntityId);
    }
    if (clientLevelId === ClientLevelIds.CAMPUS) {
      const campus = await this.findOne(orgEntityId);
      if (!campus) return campusIds;
      campusIds.push({ id: campus.id });
    }
    return campusIds;
  }

  private async findAllCampusesBelongToGroup(groupId: number): Promise<Campus[]> {
    const qb = this.campusRepository
      .createQueryBuilder('campus')
      .innerJoin('campus.client', 'client')
      .innerJoin('client.group', 'group')
      .select(['campus.id'])
      .where('group.id = :groupId', { groupId })
      .andWhere('campus.state != :state', { state: BaseEntityState.DELETED });

    return await qb.getMany();
  }

  private async findAllCampusesBelongToClient(clientId: number): Promise<Campus[]> {
    const qb = this.campusRepository
      .createQueryBuilder('campus')
      .innerJoin('campus.client', 'client')
      .select(['campus.id'])
      .where('client.id = :clientId', { clientId })
      .andWhere('campus.state != :state', { state: BaseEntityState.DELETED });

    return await qb.getMany();
  }

  async campusIsEnabled(campusId: number): Promise<boolean> {
    const qb = this.campusRepository
      .createQueryBuilder('campus')
      .where('campus.id = :campusId', { campusId })
      .andWhere('campus.state = :state', { state: BaseEntityState.ENABLED });

    return await qb.getExists();
  }

  async campusExists(id: number): Promise<boolean> {
    return await this.campusRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }

  async partialUpdate(criteria: Partial<Campus>, data: UpdateCampusDto) {
    await this.campusRepository.update(criteria, data);
  }
}
