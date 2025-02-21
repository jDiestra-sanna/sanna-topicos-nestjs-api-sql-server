import { BadGatewayException, BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { getSystemDatetime } from 'src/common/helpers/date';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { CreateGroupDto } from './dto/create-group.dto';
import { ReqQuery } from './dto/req-query.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { SettingsService } from '../settings/settings.service';
import { SettingNames } from '../settings/entities/setting.entity';
import { SettingCorrelatives } from '../settings/correlatives.interface';
import { Client } from '../clients/entities/client.entity';
import { Campus } from '../campus/entities/campus.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    private settingsService: SettingsService,
    @InjectRepository(Client) private clientsRepository: Repository<Client>,
    @InjectRepository(Campus) private campusRepository: Repository<Campus>,
  ) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<Group>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.groupsRepository.createQueryBuilder('group');

    qb.where('group.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.query) {
      qb.andWhere('CONCAT(group.name, group.contact, group.correlative) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(group.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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

  async findOne(id: number): Promise<Group> {
    return await this.groupsRepository.findOneBy({ id });
  }

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const setting = await this.settingsService.findOneByName(SettingNames.CORRELATIVES);

    if (!setting) {
      throw new InternalServerErrorException('Configuracion de correlativos no existe');
    }

    const settingCorrelatives: SettingCorrelatives = JSON.parse(setting.value);

    settingCorrelatives.group = settingCorrelatives.group + 1;

    const newGroup = await this.groupsRepository.save({
      ...createGroupDto,
      correlative: settingCorrelatives.group.toString().padStart(2, '0'),
    });

    setting.value = JSON.stringify(settingCorrelatives);

    await this.settingsService.updateBySetting(setting);

    return newGroup;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.groupsRepository.findOneBy({ id });

    if (!group) return;

    group.date_updated = getSystemDatetime();

    const updatedPost = Object.assign(group, updateGroupDto);

    await this.groupsRepository.save(updatedPost);
  }

  async remove(id: number, forever: boolean = false) {
    const group = await this.groupsRepository.findOneBy({ id });

    if (!group) return;

    if (forever) {
      await this.groupsRepository.delete(id);
    } else {
      await this.changeStateAndCascade(id, BaseEntityState.DELETED);
    }
  }

  async enable(id: number) {
    const group = await this.groupsRepository.findOneBy({ id });

    if (!group) return;

    await this.changeStateAndCascade(id, BaseEntityState.ENABLED);
  }

  async disable(id: number) {
    const group = await this.groupsRepository.findOneBy({ id });

    if (!group) return;

    await this.changeStateAndCascade(id, BaseEntityState.DISABLED);
  }

  private async changeStateAndCascade(id: number, state: BaseEntityState): Promise<void> {
    await this.groupsRepository.update(id, { state, date_updated: getSystemDatetime() });
    await this.clientsRepository
      .createQueryBuilder('client')
      .update(Client)
      .set({ state, date_updated: getSystemDatetime() })
      .where('group_id = :groupId', { groupId: id })
      .execute();

    const clientSubQuery = this.clientsRepository
      .createQueryBuilder('client')
      .select('client.id')
      .where('client.group_id = :groupId', { groupId: id })
      .getQuery();

    await this.campusRepository
      .createQueryBuilder('campus')
      .update(Campus)
      .set({ state, date_updated: getSystemDatetime() })
      .where(`campus.client_id IN (${clientSubQuery})`)
      .setParameters({ groupId: id })
      .execute();
  }

  async groupExists(id: number) {
    return await this.groupsRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
