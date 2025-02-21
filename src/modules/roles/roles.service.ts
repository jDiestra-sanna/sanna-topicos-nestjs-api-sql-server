import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { getSystemDatetime } from 'src/common/helpers/date';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { ReqQuery } from './dto/req-query.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Perms } from './entities/perms.entity';
import { Module } from '../modules/entities/module.entity';
import { NestedModule } from './nested-module.interface';
import { UserTypeIds } from '../users/entities/type-user.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
    @InjectRepository(Perms) private permsRepository: Repository<Perms>,
    @InjectRepository(Module) private modulesRepository: Repository<Module>,
  ) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<Role>> {
    const skip = req_query.limit * req_query.page;

    let qb = this.rolesRepository.createQueryBuilder('role');

    qb.where('role.state != :state', { state: BaseEntityState.DELETED });
    qb.leftJoinAndMapOne('role.home_module', Module, 'module', 'module.id = role.home_module_id');
    qb.select(['role', 'module.id', 'module.name']);

    if (req_query.query) {
      qb.andWhere('role.name LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(role.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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

  // TODO TODOS LOS FIND ONE Y SIMILARES DEBERIAN DE RETORNAR NULL SI NO ENCUENTRA
  async findOne(id: number) {
    let role = await this.rolesRepository.findOneBy({ id });

    if (!role) return null;

    role.home_module = await this.findHomeModuleById(role.home_module_id);

    role.perms = await this.findModulesByRole(id);

    return role;
  }

  async create(createRoleDto: CreateRoleDto, optsData?: { user_type_id: UserTypeIds }) {
    const newRole = await this.rolesRepository.save({ ...createRoleDto, ...optsData });

    createRoleDto.perms.forEach(async perm => {
      await this.permsRepository.save({
        role_id: newRole.id,
        ...perm,
      });
    });

    return newRole;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    let role = await this.rolesRepository.findOneBy({ id });

    if (!role) return;

    role.date_updated = getSystemDatetime();

    const updatedPost = Object.assign(role, updateRoleDto);

    await this.permsRepository.delete({ role_id: role.id });

    await this.rolesRepository.save(updatedPost);

    updateRoleDto.perms.forEach(async perm => {
      await this.permsRepository.save({
        role_id: role.id,
        ...perm,
      });
    });
  }

  async findHomeModuleById(id: number) {
    let qb = this.modulesRepository.createQueryBuilder('module');

    qb.select(['module.id', 'module.name']);
    qb.where('module.id = :id', { id });
    return await qb.getOne();
  }

  async findModulesByRole(role_id: number) {
    let qb = this.permsRepository.createQueryBuilder('perms');

    qb.leftJoinAndMapOne('perms.module', Module, 'module', 'module.id = perms.module_id');
    qb.where('perms.role_id = :role_id', { role_id });
    qb.select([
      'perms.id',
      'perms.interface',
      'perms.see',
      'perms.create',
      'perms.edit',
      'perms.delete',
      'module.id',
      'module.name',
      'module.url',
      'module.icon',
      'module.parent_id',
      'module.sort',
    ]);
    qb.orderBy('module.sort');

    return await qb.getMany();
  }

  nestModules(perms: Perms[], parentId = 0) {
    let nestedModules: NestedModule[] = [];

    perms.forEach(perm => {
      if (perm.module.parent_id == parentId) {
        const children = this.nestModules(perms, perm.module.id);
        let type = 'item';

        if (children.length) type = 'collapse';

        let nestedModule: NestedModule = {
          id: perm.module.id,
          interface: perm.interface,
          see: perm.see,
          create: perm.create,
          edit: perm.edit,
          delete: perm.delete,
          icon: perm.module.icon,
          sort: perm.module.sort,
          parent_id: perm.module.parent_id,
          title: perm.module.name,
          url: perm.module.url ? `/${perm.module.url}` : '',
          type,
          children,
        };

        nestedModules.push(nestedModule);
      }
    });

    return nestedModules;
  }

  async remove(id: number, forever: boolean = false) {
    const role = await this.rolesRepository.findOneBy({ id });

    if (!role) return;

    if (forever) {
      await this.rolesRepository.delete(id);
    } else {
      role.state = BaseEntityState.DELETED;
      role.date_deleted = getSystemDatetime();

      await this.rolesRepository.save(role);
    }
  }

  async enable(id: number) {
    const role = await this.rolesRepository.findOneBy({ id });

    if (!role) return;

    role.state = BaseEntityState.ENABLED;
    role.date_updated = getSystemDatetime();

    await this.rolesRepository.save(role);
  }

  async disable(id: number) {
    const role = await this.rolesRepository.findOneBy({ id });

    if (!role) return;

    role.state = BaseEntityState.DISABLED;
    role.date_updated = getSystemDatetime();

    await this.rolesRepository.save(role);
  }

  async roleExists(id: number): Promise<boolean> {
    return await this.rolesRepository
      .createQueryBuilder('roles')
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
