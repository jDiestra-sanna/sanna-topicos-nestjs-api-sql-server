import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Not, Repository } from 'typeorm';
import { NewUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { getSystemDatetime } from 'src/common/helpers/date';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { ReqQuery } from './dto/req-query.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { hashPassword } from 'src/common/helpers/password';
import { UserTypeIds } from './entities/type-user.entity';
import { DocumentType, documentType } from '../document-types/entities/document-types.entity';
import { ReqQueryExport } from './dto/req-query-export.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<User>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.usersRepository.createQueryBuilder('user');

    qb.select([
      'user.id',
      'user.state',
      'user.date_created',
      'user.date_updated',
      'user.user_type_id',
      'user.name',
      'user.surname_first',
      'user.surname_second',
      'user.document_type_id',
      'user.document_number',
      'user.sex_id',
      'user.birthdate',
      'user.proffesion_id',
      'user.speciality',
      'user.colegiatura',
      'user.ubigeo_peru_department_id',
      'user.ubigeo_peru_province_id',
      'user.ubigeo_peru_district_id',
      'user.address',
      'user.cost_center_id',
      'user.can_download',
      'user.is_central',
      'user.email',
      'user.phone',
      'user.role_id',
    ]);
    qb.leftJoinAndSelect('user.role', 'role');
    qb.leftJoinAndMapOne(
      'user.document_type',
      DocumentType,
      'document_type',
      'document_type.id = user.document_type_id',
    );
    qb.where('user.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.role_id > 0) {
      qb.andWhere('user.role_id = :roleId', { roleId: req_query.role_id });
    }

    if (req_query.query) {
      qb.andWhere(
        'CONCAT(user.name, user.surname, user.surname_first, user.surname_second, user.email, user.document_number, user.phone) LIKE :pattern',
        {
          pattern: `%${req_query.query}%`,
        },
      );
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(user.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ id });
  }

  async findOneByEmail(email: string, user_type_id: UserTypeIds = UserTypeIds.USER): Promise<User | null> {
    return await this.usersRepository.findOneBy({ email, user_type_id, state: Not(BaseEntityState.DELETED) });
  }

  async exportAll(req_query: ReqQueryExport): Promise<User[]> {
    let qb = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.surname_first',
        'user.surname_second',
        'user.email',
        'user.date_created',
        'user.phone',
        'user.document_number',
        'user.role_id',
        'role.name',
        'document_type.name',
      ])
      .addSelect(
        "CASE WHEN user.is_central = 1 THEN 'SI' ELSE 'NO' END", 'user_is_central'
      )
      .leftJoin('user.role', 'role')
      .leftJoin('user.document_type', 'document_type')
      .where('user.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.role_id > 0) {
      qb.andWhere('user.role_id = :roleId', { roleId: req_query.role_id });
    }

    if (req_query.query) {
      qb.andWhere(
        'CONCAT(user.name, user.surname, user.surname_first, user.surname_second, user.email, user.document_number, user.phone) LIKE :pattern',
        {
          pattern: `%${req_query.query}%`,
        },
      );
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(user.date_created AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: req_query.date_from,
        date_to: req_query.date_to,
      });
    }
  
    return await qb.getRawMany();
  }

  async existsEmail(
    email: string,
    excludeUserId: number = 0,
    userTypeId: UserTypeIds = UserTypeIds.USER,
  ): Promise<boolean> {
    let qb = this.usersRepository.createQueryBuilder('user');
    qb.where('user.email = :email', { email });
    qb.andWhere('user.state != :state', { state: BaseEntityState.DELETED });
    qb.andWhere('user.user_type_id = :userTypeId', { userTypeId });

    if (excludeUserId) {
      qb.andWhere('user.id != :excludeUserId', { excludeUserId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async create(newUserDto: NewUserDto): Promise<User> {
    if (newUserDto.document_type_id === documentType.FOREIGN_CARD)
      newUserDto.document_number = newUserDto.document_number.padStart(12, '0');

    newUserDto.password = await hashPassword(newUserDto.password);

    const newUser = await this.usersRepository.save(newUserDto);

    return newUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.document_type_id === documentType.FOREIGN_CARD)
      updateUserDto.document_number = updateUserDto.document_number.padStart(12, '0');

    const user = await this.usersRepository.findOneBy({ id });

    if (!user) return;

    user.date_updated = getSystemDatetime();

    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    } else {
      updateUserDto.password = user.password;
    }

    const updatedPost = Object.assign(user, updateUserDto);

    await this.usersRepository.save(updatedPost);
  }

  async remove(id: number, forever: boolean = false) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) return;

    if (forever) {
      await this.usersRepository.delete(id);
    } else {
      user.state = BaseEntityState.DELETED;
      user.date_deleted = getSystemDatetime();

      await this.usersRepository.save(user);
    }
  }

  async enable(id: number) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) return;

    user.state = BaseEntityState.ENABLED;
    user.date_updated = getSystemDatetime();

    await this.usersRepository.save(user);
  }

  async disable(id: number) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) return;

    user.state = BaseEntityState.DISABLED;
    user.date_updated = getSystemDatetime();

    await this.usersRepository.save(user);
  }

  async userExists(id: number) {
    return await this.usersRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
