import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { getSystemDatetime } from 'src/common/helpers/date';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { ReqQuery } from './dto/req-query.dto';
import { Client } from './entities/client.entity';
import { CreateClientpDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Group } from '../groups/entities/group.entity';
import { GroupsService } from '../groups/groups.service';
import { SettingsService } from '../settings/settings.service';
import { SettingNames } from '../settings/entities/setting.entity';
import { SettingCorrelatives } from '../settings/correlatives.interface';
import { Campus } from '../campus/entities/campus.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    private groupsService: GroupsService,
    private settingsService: SettingsService,
    @InjectRepository(Campus) private campusRepository: Repository<Campus>,
  ) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<Client>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.clientsRepository.createQueryBuilder('client');

    qb.where('client.state != :state', { state: BaseEntityState.DELETED });
    qb.leftJoinAndMapOne('client.group', Group, 'group', 'group.id = client.group_id');

    if (req_query.query) {
      qb.andWhere('CONCAT(client.name, client.contact, client.correlative) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.group_id === 0) {
      qb.andWhere('client.group_id is null');
    }

    if (req_query.group_id) {
      qb.andWhere('client.group_id = :group_id', { group_id: req_query.group_id });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(client.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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

  async findOne(id: number): Promise<Client> {
    return await this.clientsRepository.findOneBy({ id });
  }

  async create(createClientDto: CreateClientpDto): Promise<Client> {
    const setting = await this.settingsService.findOneByName(SettingNames.CORRELATIVES);

    const group = createClientDto.group_id > 0 ? await this.groupsService.findOne(createClientDto.group_id) : null;
    let groupCorrelative = !group ? '00' : group.correlative;

    if (!setting) {
      throw new InternalServerErrorException('Configuracion de correlativos no existe');
    }

    const settingCorrelatives: SettingCorrelatives = JSON.parse(setting.value);
    let nextCorrelative = settingCorrelatives.client[groupCorrelative];

    if (nextCorrelative) {
      nextCorrelative++;
    } else {
      nextCorrelative = 1;
    }

    const newClient = await this.clientsRepository.save({
      ...createClientDto,
      correlative: `${groupCorrelative}${nextCorrelative.toString().padStart(2, '0')}`,
    });

    settingCorrelatives.client[groupCorrelative] = nextCorrelative;
    setting.value = JSON.stringify(settingCorrelatives);

    await this.settingsService.updateBySetting(setting);
    return newClient;
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const client = await this.clientsRepository.findOneBy({ id });

    if (!client) return;

    client.date_updated = getSystemDatetime();

    const updatedPost = Object.assign(client, updateClientDto);

    await this.clientsRepository.save(updatedPost);
  }

  async remove(id: number, forever: boolean = false) {
    const client = await this.clientsRepository.findOneBy({ id });

    if (!client) return;

    if (forever) {
      await this.clientsRepository.delete(id);
    } else {
      await this.changeStateAndCascade(id, BaseEntityState.DELETED);
    }
  }

  async enable(id: number) {
    const client = await this.clientsRepository.findOneBy({ id });

    if (!client) return;

    await this.changeStateAndCascade(id, BaseEntityState.ENABLED);
  }

  async disable(id: number) {
    const client = await this.clientsRepository.findOneBy({ id });

    if (!client) return;

    await this.changeStateAndCascade(id, BaseEntityState.DISABLED);
  }

  async clientExists(id: number): Promise<boolean> {
    return await this.clientsRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }

  private async changeStateAndCascade(id: number, state: BaseEntityState): Promise<void> {
    await this.clientsRepository.update(id, { state, date_updated: getSystemDatetime() });
    await this.campusRepository
      .createQueryBuilder('campus')
      .update(Campus)
      .set({ state, date_updated: getSystemDatetime() })
      .where('client_id = :clientId', { clientId: id })
      .execute();
  }
}
