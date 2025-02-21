import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { getSystemDatetime } from 'src/common/helpers/date';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Repository } from 'typeorm';
import { NewUserFileDto } from './dto/create-user-file.dto';
import { QueryFindAll } from './dto/req-query-user-file.dto';
import { UpdateUserFileDto } from './dto/update-user-file.dto';
import { File } from '../../files/entities/file.entity';
import { UserFile } from './entities/user-file.entity';
import { FileType } from '../file-types/entities/file-type.entity';
import { getUrlStaticFile } from 'src/common/helpers/file';

@Injectable()
export class UserFilesService {
  constructor(
    @InjectRepository(UserFile)
    private userFilesRepository: Repository<UserFile>,
  ) {}

  async findAll(req_query: QueryFindAll): Promise<PaginatedResult<UserFile>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.userFilesRepository.createQueryBuilder('uf');

    qb.leftJoinAndMapOne('uf.file_type', FileType, 'file_type', 'file_type.id = uf.file_type_id');
    qb.leftJoinAndMapOne('uf.file', File, 'file', 'file.id = uf.file_id');
    qb.where('uf.state != :state', { state: BaseEntityState.DELETED });
    qb.andWhere('uf.user_id = :user_id', { user_id: req_query.user_id });

    if (req_query.file_type_id) {
      qb.andWhere('file_type.id = :file_type_id', { file_type_id: req_query.file_type_id });
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

  async findOne(id: number): Promise<UserFile | null> {
    let qb = this.userFilesRepository.createQueryBuilder('uf');

    qb.leftJoinAndMapOne('uf.file_type', FileType, 'file_type', 'file_type.id = uf.file_type_id');
    qb.leftJoinAndMapOne('uf.file', File, 'file', 'file.id = uf.file_id');
    qb.where('uf.id = :id', { id });

    let userFile = await qb.getOne();

    if (userFile) {
      userFile.file.url = getUrlStaticFile(userFile.file.path);
    }

    return userFile;
  }

  async create(newUserFileDto: NewUserFileDto): Promise<number> {
    const newUserFile = await this.userFilesRepository.save(newUserFileDto);
    return newUserFile.id;
  }

  async update(id: number, updateUserFileDto: UpdateUserFileDto) {
    const userFile = await this.userFilesRepository.findOneBy({ id });
    if (!userFile) return;

    userFile.date_updated = getSystemDatetime();

    const updatedPost = Object.assign(userFile, updateUserFileDto);

    await this.userFilesRepository.save(updatedPost);
  }

  async remove(id: number, forever: boolean = false) {
    const userFile = await this.userFilesRepository.findOneBy({ id });
    if (!userFile) return;

    if (forever) {
      await this.userFilesRepository.delete(id);
    } else {
      userFile.state = BaseEntityState.DELETED;
      userFile.date_deleted = getSystemDatetime();

      await this.userFilesRepository.save(userFile);
    }
  }

  async isFileOfUser(fileId: number, userId: number) {
    const userAssignment = await this.userFilesRepository.findOneBy({ id: fileId, user_id: userId });
    return !!userAssignment;
  }
}
