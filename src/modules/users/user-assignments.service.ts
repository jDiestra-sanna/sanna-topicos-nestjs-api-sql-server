import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { getSystemDatetime } from 'src/common/helpers/date';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Repository } from 'typeorm';
import { Campus } from '../campus/entities/campus.entity';
import { Client } from '../clients/entities/client.entity';
import { Group } from '../groups/entities/group.entity';
import { NewUserAssignmentDto } from './dto/new-user-assignment.dto';
import { QueryFindAll } from './dto/req-query-user-assignment.dto';
import { UpdateUserAssignmentDto } from './dto/update-user-assignment.dto';
import { UserAssigment } from './entities/user-assignment.entity';
import { RoleIds } from '../roles/entities/role.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UserAssignmentsService {
  constructor(
    @InjectRepository(UserAssigment)
    private userAssignmentsRepository: Repository<UserAssigment>,
  ) {}

  async findAll(req_query: QueryFindAll): Promise<PaginatedResult<UserAssigment>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.userAssignmentsRepository.createQueryBuilder('ua');

    qb.leftJoinAndMapOne('ua.campus', Campus, 'campus', 'campus.id = ua.campus_id');
    qb.leftJoinAndMapOne('campus.client', Client, 'client', 'client.id = campus.client_id');
    qb.leftJoinAndMapOne('client.group', Group, 'group', 'group.id = client.group_id');
    qb.select([
      'ua.id',
      'ua.state',
      'ua.date_created',
      'ua.campus_id',
      'group.id',
      'group.name',
      'group.correlative',
      'group.state',
      'client.id',
      'client.name',
      'client.correlative',
      'client.state',
      'client.group_id',
      'campus.id',
      'campus.client_id',
      'campus.name',
      'campus.correlative',
      'campus.state',
    ]);

    qb.where('ua.state != :state', { state: BaseEntityState.DELETED });
    qb.andWhere('ua.user_id = :user_id', { user_id: req_query.user_id });

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

  async findUsersByCampus(campus_id: number, role_id?: RoleIds): Promise<User[]> {
    let qb = this.userAssignmentsRepository.createQueryBuilder('ua');
    qb.innerJoinAndSelect('ua.user', 'user');
    qb.where('ua.campus_id = :campus_id', { campus_id });
    qb.andWhere('ua.state = :state', { state: BaseEntityState.ENABLED });
    qb.addSelect('user.id AS id');

    if (role_id) {
      qb.andWhere('user.role_id = :role_id', { role_id });
    }

    // qb.select(['user.*']);

    return await qb.getRawMany();
  }

  async findOne(id: number): Promise<UserAssigment | null> {
    let qb = this.userAssignmentsRepository.createQueryBuilder('ua');

    qb.leftJoinAndMapOne('ua.campus', Campus, 'campus', 'campus.id = ua.campus_id');
    qb.leftJoinAndMapOne('campus.client', Client, 'client', 'client.id = campus.client_id');
    qb.leftJoinAndMapOne('client.group', Group, 'group', 'group.id = client.group_id');
    qb.select([
      'ua.id',
      'ua.state',
      'ua.date_created',
      'ua.campus_id',
      'group.id',
      'group.name',
      'group.correlative',
      'group.state',
      'client.id',
      'client.name',
      'client.correlative',
      'client.state',
      'client.group_id',
      'campus.id',
      'campus.client_id',
      'campus.name',
      'campus.correlative',
      'campus.state',
    ]);
    qb.where('ua.id = :id', { id });

    return await qb.getOne();
  }

  async findManyByUser(userId: number): Promise<UserAssigment[] | null> {
    let qb = this.userAssignmentsRepository
      .createQueryBuilder('ua')
      .select('ua.campus_id')
      .where('ua.user_id = :userId', { userId })
      .andWhere('ua.state != :state', { state: BaseEntityState.DELETED });

    return await qb.getMany();
  }

  async create(newUserAssigmentDto: NewUserAssignmentDto): Promise<UserAssigment> {
    const newUserAssigment = await this.userAssignmentsRepository.save(newUserAssigmentDto);
    return newUserAssigment;
  }

  async batchInsert(newUserAssignmenstDto: NewUserAssignmentDto[]): Promise<UserAssigment[]> {
    const newUserAssignments = await this.userAssignmentsRepository
      .createQueryBuilder()
      .insert()
      .into(UserAssigment)
      .values(newUserAssignmenstDto)
      .execute();

    const userAssignmentIds = newUserAssignments.identifiers.map(identifier => identifier.id);

    return userAssignmentIds;
  }

  async batchDelete(userId: number) {
    await this.userAssignmentsRepository
      .createQueryBuilder()
      .update(UserAssigment)
      .set({ state: BaseEntityState.DELETED, date_deleted: getSystemDatetime() })
      .where('user_id = :userId', { userId })
      .execute();
  }

  async update(id: number, updateUserAssignmentDto: UpdateUserAssignmentDto) {
    const userAssignment = await this.userAssignmentsRepository.findOneBy({ id });
    if (!userAssignment) return;

    userAssignment.date_updated = getSystemDatetime();

    const updatedPost = Object.assign(userAssignment, updateUserAssignmentDto);

    await this.userAssignmentsRepository.save(updatedPost);
  }

  async remove(id: number, forever: boolean = false) {
    const userAssignment = await this.userAssignmentsRepository.findOneBy({ id });
    if (!userAssignment) return;

    if (forever) {
      await this.userAssignmentsRepository.delete(id);
    } else {
      userAssignment.state = BaseEntityState.DELETED;
      userAssignment.date_deleted = getSystemDatetime();

      await this.userAssignmentsRepository.save(userAssignment);
    }
  }

  async isAssignmentOfUser(assignmentId: number, userId: number) {
    const userAssignment = await this.userAssignmentsRepository.findOneBy({ id: assignmentId, user_id: userId });
    return !!userAssignment;
  }

  async existUserAssignments(userId: number): Promise<boolean> {
    let qb = this.userAssignmentsRepository
      .createQueryBuilder('user_assignments')
      .innerJoin('user_assignments.campus', 'campus')
      .where('user_assignments.user_id = :userId', { userId })
      .andWhere('user_assignments.state != :state', { state: BaseEntityState.DELETED })
      .andWhere('campus.state = :_state', { _state: BaseEntityState.ENABLED });

    return await qb.getExists();
  }
}
