import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProtocolFile } from './entities/protocol-files.entity';
import { Repository } from 'typeorm';
import { CreateProtocolFileDto } from './dto/create-protocol-file.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { ReqQuery } from './dto/req-query-protocol-files.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { UpdateProtocolFileDto } from './dto/update-protocol-file.dto';
import { getSystemDatetime } from 'src/common/helpers/date';

@Injectable()
export class ProtocolFilesService {
  constructor(@InjectRepository(ProtocolFile) private protocolFileRepository: Repository<ProtocolFile>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<ProtocolFile>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.protocolFileRepository.createQueryBuilder('protocol_files');

    qb.leftJoinAndSelect('protocol_files.protocol', 'protocol');
    qb.leftJoinAndSelect('protocol_files.file', 'file');

    qb.where('protocol_files.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.protocol_id) {
      qb.andWhere('protocol_files.protocol_id = :protocol_id', { protocol_id: req_query.protocol_id });
    }

    if (req_query.file_id) {
      qb.andWhere('protocol_files.file_id = :file_id', { file_id: req_query.file_id });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(protocol_files.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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
    const protocolFile = await this.protocolFileRepository.findOne({
      where: { id },
      relations: ['protocol', 'file'],
    });

    if (!protocolFile) return null;

    return protocolFile;
  }

  async create(createProtocolFileDto: CreateProtocolFileDto) {
    const newProtocolFile = await this.protocolFileRepository.save({ ...createProtocolFileDto });

    if (!newProtocolFile) return null;

    return newProtocolFile;
  }

  async update(id: number, updateProtocolFileDto: UpdateProtocolFileDto) {
    const protocolFile = await this.protocolFileRepository.findOneBy({ id });

    if (!protocolFile) return;

    protocolFile.date_updated = getSystemDatetime();
    const updatedProtocolFile = Object.assign(protocolFile, updateProtocolFileDto);
    await this.protocolFileRepository.save(updatedProtocolFile);
  }

  async enable(id: number) {
    const protocolFile = await this.protocolFileRepository.findOneBy({ id });
    if (!protocolFile) return;

    protocolFile.state = BaseEntityState.ENABLED;
    protocolFile.date_updated = getSystemDatetime();

    await this.protocolFileRepository.save(protocolFile);
  }

  async disable(id: number) {
    const protocolFile = await this.protocolFileRepository.findOneBy({ id });
    if (!protocolFile) return;

    protocolFile.state = BaseEntityState.DISABLED;
    protocolFile.date_updated = getSystemDatetime();

    await this.protocolFileRepository.save(protocolFile);
  }

  async remove(id: number, forever: boolean = false) {
    const protocolFile = await this.protocolFileRepository.findOneBy({ id });
    if (!protocolFile) return;

    if (forever) {
      await this.protocolFileRepository.delete(id);
    } else {
      protocolFile.state = BaseEntityState.DELETED;
      protocolFile.date_deleted = getSystemDatetime();
      await this.protocolFileRepository.save(protocolFile);
    }
  }

  async exitsFileId(file_id: number, excludeFileId: Boolean = false): Promise<boolean> {
    let qb = this.protocolFileRepository.createQueryBuilder('protocol_files');
    qb.where('protocol_files.file_id = :file_id', { file_id });
    qb.andWhere('protocol_files.state != :state', { state: BaseEntityState.DELETED });

    if (excludeFileId) qb.andWhere('protocol_files.file_id != :file_id', { file_id: excludeFileId });

    const count = await qb.getCount();
    return count > 0;
  }

  async protocolFileBelongsToProtocol(protocolFileId: number, protocolId: number): Promise<boolean> {
    let qb = this.protocolFileRepository.createQueryBuilder('protocol_files');
    qb.where('protocol_files.id = :protocolFileId', { protocolFileId });
    qb.andWhere('protocol_files.protocol_id = :protocolId', { protocolId });
    qb.andWhere('protocol_files.state != :state', { state: BaseEntityState.DELETED });

    const exists = await qb.getExists();
    return exists;
  }
}
