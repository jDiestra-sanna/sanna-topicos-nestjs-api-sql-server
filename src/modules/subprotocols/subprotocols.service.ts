import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubProtocol } from './entities/subprotocol.entity';
import { Repository } from 'typeorm';
import { ReqQuery } from './dto/req-query.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { CreateSubProtocolDto } from './dto/create-subprotocol.dto';
import { getSystemDatetime } from 'src/common/helpers/date';
import { UpdateSubProtocolDto } from './dto/update-subprotocol.dto';

@Injectable()
export class SubProtocolsService {
  constructor(@InjectRepository(SubProtocol) private subProtocolRespository: Repository<SubProtocol>) {}

  async findAll(req_query: ReqQuery) {
    const skip = req_query.limit * req_query.page;
    let qb = this.subProtocolRespository.createQueryBuilder('subprotocols');

    qb.leftJoinAndSelect('subprotocols.protocol', 'protocol');
    qb.leftJoinAndSelect('subprotocols.subprotocol_files', 'subprotocol_files', 'subprotocol_files.state != :state', {
      state: BaseEntityState.DELETED,
    });
    qb.leftJoinAndSelect('subprotocol_files.file', 'file');

    qb.where('subprotocols.state != :state', { state: BaseEntityState.DELETED });

    qb.andWhere('subprotocols.protocol_id = :protocol_id', { protocol_id: req_query.protocol_id });

    if (req_query.query) {
      qb.andWhere('CONCAT(subprotocols.title, subprotocols.description) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(subprotocols.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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
    const subProtocol = await this.subProtocolRespository.findOne({
      where: { id },
      relations: ['protocol', 'subprotocol_files', 'subprotocol_files.file'],
    });

    if (!subProtocol) return null;

    return subProtocol;
  }

  async findsubProtocolBelongsToProtocol(protocolId: number, subProtocolId: number) {
    let qb = this.subProtocolRespository.createQueryBuilder('subprotocols');
    qb.where('subprotocols.id = :id', { id: subProtocolId });
    qb.andWhere('subprotocols.protocol_id = :protocol_id', { protocol_id: protocolId });

    const exists = await qb.getExists();
    if (!exists) return null;

    return exists;
  }

  async create(createSubProtocolDto: CreateSubProtocolDto) {
    const newSubProtocol = await this.subProtocolRespository.save({ ...createSubProtocolDto });

    if (!newSubProtocol) return null;

    return newSubProtocol;
  }

  async update(id: number, updateSubProtocolDto: UpdateSubProtocolDto) {
    const subProtocol = await this.subProtocolRespository.findOneBy({ id });

    if (!subProtocol) return;

    subProtocol.date_updated = getSystemDatetime();
    const updatedSubProtocol = Object.assign(subProtocol, updateSubProtocolDto);
    await this.subProtocolRespository.save(updatedSubProtocol);
  }

  async remove(id: number, forever: boolean = false) {
    const subProtocol = await this.subProtocolRespository.findOneBy({ id });
    if (!subProtocol) return;

    if (forever) {
      await this.subProtocolRespository.delete(id);
    } else {
      subProtocol.state = BaseEntityState.DELETED;
      subProtocol.date_deleted = getSystemDatetime();
      await this.subProtocolRespository.save(subProtocol);
    }
  }

  async enable(id: number) {
    const subProtocol = await this.subProtocolRespository.findOneBy({ id });
    if (!subProtocol) return;

    subProtocol.state = BaseEntityState.ENABLED;
    subProtocol.date_updated = getSystemDatetime();

    await this.subProtocolRespository.save(subProtocol);
  }

  async disable(id: number) {
    const subProtocol = await this.subProtocolRespository.findOneBy({ id });
    if (!subProtocol) return;

    subProtocol.state = BaseEntityState.DISABLED;
    subProtocol.date_updated = getSystemDatetime();

    await this.subProtocolRespository.save(subProtocol);
  }

  async subprotocolExists(id: number): Promise<boolean> {
    return await this.subProtocolRespository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
