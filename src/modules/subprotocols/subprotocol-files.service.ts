import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubProtocolFile } from './entities/subprotocol-files.entity';
import { Repository } from 'typeorm';
import { ReqQuery } from './dto/req-query-subprotocol-file.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { CreateSubProtocolFileDto } from './dto/create-subprotocol-file.dto';
import { UpdateSubProtocolFileDto } from './dto/update-subprotocol-file.dto';
import { getSystemDatetime } from 'src/common/helpers/date';

@Injectable()
export class SubProtocolFilesService {
  constructor(@InjectRepository(SubProtocolFile) private subProtocolFileRepository: Repository<SubProtocolFile>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<SubProtocolFile>> {
    const skip = req_query.limit * req_query.page;
    const qb = this.subProtocolFileRepository.createQueryBuilder('subprotocol_files');

    qb.leftJoinAndSelect('subprotocol_files.subprotocol', 'subprotocol');
    qb.leftJoinAndSelect('subprotocol_files.file', 'file');

    qb.where('subprotocol_files.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.subprotocol_id) {
      qb.andWhere('subprotocol_files.subprotocol_id = :subprotocol_id', { subprotocol_id: req_query.subprotocol_id });
    }

    if (req_query.file_id) {
      qb.andWhere('subprotocol_files.file_id = :file_id', { file_id: req_query.file_id });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(subprotocol_files.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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
    const subProtocolFile = await this.subProtocolFileRepository.findOne({
      where: { id },
      relations: ['subprotocol', 'file'],
    });

    if (!subProtocolFile) return null;

    return subProtocolFile;
  }

  async create(createSubProtocolFileDto: CreateSubProtocolFileDto) {
    const newSubProtocolFile = await this.subProtocolFileRepository.save({ ...createSubProtocolFileDto });

    if (!newSubProtocolFile) return null;

    return newSubProtocolFile;
  }

  async update(id: number, updateSubProtocolFileDto: UpdateSubProtocolFileDto) {
    const subProtocolFile = await this.subProtocolFileRepository.findOneBy({ id });

    if (!subProtocolFile) return;

    subProtocolFile.date_updated = getSystemDatetime();
    const updatedSubProtocolFile = Object.assign(subProtocolFile, updateSubProtocolFileDto);
    await this.subProtocolFileRepository.save(updatedSubProtocolFile);
  }

  async remove(id: number, forever: boolean = false) {
    const subProtocolFile = await this.subProtocolFileRepository.findOneBy({ id });
    if (!subProtocolFile) return;

    if (forever) {
      await this.subProtocolFileRepository.delete(id);
    } else {
      subProtocolFile.state = BaseEntityState.DELETED;
      subProtocolFile.date_deleted = getSystemDatetime();
      await this.subProtocolFileRepository.save(subProtocolFile);
    }
  }

  async exitsFileId(file_id: number, excludeFileId: Boolean = false): Promise<boolean> {
    let qb = this.subProtocolFileRepository.createQueryBuilder('subprotocol_files');
    qb.where('subprotocol_files.file_id = :file_id', { file_id });
    qb.andWhere('subprotocol_files.state != :state', { state: BaseEntityState.DELETED });

    if (excludeFileId) qb.andWhere('subprotocol_files.file_id != :file_id', { file_id });

    const exists = await qb.getExists();
    return exists;
  }

  async subprotocolFileBelongsToSubprotocol(subprotocolFileId: number, subprotocolId: number): Promise<boolean> {
    let qb = this.subProtocolFileRepository.createQueryBuilder('subprotocol_files');
    qb.where('subprotocol_files.id = :subprotocolFileId', { subprotocolFileId });
    qb.andWhere('subprotocol_files.subprotocol_id = :subprotocolId', { subprotocolId });
    qb.andWhere('subprotocol_files.state != :state', { state: BaseEntityState.DELETED });

    const exists = await qb.getExists();
    return exists;
  }
}
