import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Protocol } from './entities/protocol.entity';
import { Repository } from 'typeorm';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { CreateProtocolDto } from './dto/create-protocol.dto';
import { UpdateProtocolDto } from './dto/update-protocol.dto';
import { getSystemDate, getSystemDatetime } from 'src/common/helpers/date';
import { ReqQuery } from './dto/req-query.dto';
import { ProtocolTypes } from './entities/protocol-type.entity';
import { User } from '../users/entities/user.entity';
import { RoleIds } from '../roles/entities/role.entity';
import { AttendanceRecordsService } from '../attendance-records/attendance-records.service';
import { CampusService } from '../campus/campus.service';

@Injectable()
export class ProtocolsService {
  constructor(
    @InjectRepository(Protocol) private protocolRepository: Repository<Protocol>,
    private readonly attendanceRecordsService: AttendanceRecordsService,
    private readonly campusService: CampusService,
  ) {}

  async findAll(req_query: ReqQuery, user: User): Promise<PaginatedResult<Protocol>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.protocolRepository.createQueryBuilder('protocols');

    qb.leftJoinAndSelect('protocols.protocol_type', 'protocol_types');
    qb.leftJoinAndSelect('protocols.protocol_files', 'protocol_files', 'protocol_files.state != :state', {
      state: BaseEntityState.DELETED,
    });
    qb.leftJoinAndSelect('protocol_files.file', 'files');
    qb.leftJoinAndSelect('protocols.client', 'clients');
    qb.where('protocols.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.protocol_type_id) {
      if (req_query.protocol_type_id === ProtocolTypes.PROTOCOL_CLIENT) {
        if (user.role_id === RoleIds.HEALTH_TEAM) {
          // Buscar el cliente al desde medical records
          const current_date = getSystemDate();
          const attendanceRecord = await this.attendanceRecordsService.findOneBy(user.id, current_date);
          const campusId = attendanceRecord.campus_id;
          const client = await this.campusService.findOne(campusId);
          const clientId = client.client_id;
          qb.andWhere('protocols.client_id = :clientId', { clientId });
        }
      }
      qb.andWhere('protocols.protocol_type_id = :protocol_type_id', { protocol_type_id: req_query.protocol_type_id });
    }

    if (req_query.client_id && req_query.client_id.length > 0) {
      qb.andWhere('protocols.client_id IN (:...client_ids)', { client_ids: req_query.client_id });
    }

    if (req_query.query) {
      qb.andWhere('CONCAT(protocols.title, protocols.description) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(protocols.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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
    const protocol = await this.protocolRepository.findOne({
      where: { id },
      relations: ['protocol_type', 'protocol_files', 'protocol_files.file'],
    });

    if (!protocol) return null;

    return protocol;
  }

  async findOneAndFilterState(id: number) {
    const protocol = await this.protocolRepository
      .createQueryBuilder('protocols')
      .where('protocols.id = :id', { id })
      .andWhere('protocols.state != :state', { state: BaseEntityState.DELETED })
      .getOne();

    if (!protocol) return null;

    return protocol;
  }

  async create(createProtocolDto: CreateProtocolDto) {
    const newProtocol = await this.protocolRepository.save({ ...createProtocolDto });

    if (!newProtocol) return null;

    return newProtocol;
  }

  async update(id: number, updateProtocolDto: UpdateProtocolDto) {
    const protocol = await this.protocolRepository.findOneBy({ id });

    if (!protocol) return;

    if (updateProtocolDto.protocol_type_id == ProtocolTypes.PROTOCOL_SANNA) updateProtocolDto.client_id = null;

    protocol.date_updated = getSystemDatetime();
    const updatedProtocol = Object.assign(protocol, updateProtocolDto);
    await this.protocolRepository.save(updatedProtocol);
  }

  async remove(id: number, forever: boolean = false) {
    const protocol = await this.protocolRepository.findOneBy({ id });

    if (!protocol) return;

    if (forever) {
      await this.protocolRepository.delete(id);
    } else {
      protocol.state = BaseEntityState.DELETED;
      protocol.date_deleted = getSystemDatetime();
      await this.protocolRepository.save(protocol);
    }
  }

  async enable(id: number) {
    const protocol = await this.protocolRepository.findOneBy({ id });
    if (!protocol) return;

    protocol.state = BaseEntityState.ENABLED;
    protocol.date_updated = getSystemDatetime();

    await this.protocolRepository.save(protocol);
  }

  async disable(id: number) {
    const protocol = await this.protocolRepository.findOneBy({ id });
    if (!protocol) return;

    protocol.state = BaseEntityState.DISABLED;
    protocol.date_updated = getSystemDatetime();

    await this.protocolRepository.save(protocol);
  }

  async protocolExists(id: number): Promise<boolean> {
    return await this.protocolRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
