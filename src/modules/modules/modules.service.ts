import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getSystemDatetime } from 'src/common/helpers/date';
import { Module } from './entities/module.entity';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { UpdateModuleDto } from './dto/update-module.dto';
import { NestedModuleDto } from './dto/nested-module.dto';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private modulesRepository: Repository<Module>,
  ) {}

  async findAllNested(): Promise<NestedModuleDto[]> {
    let qb = this.modulesRepository.createQueryBuilder('module');

    qb.where('module.state != :state', { state: BaseEntityState.DELETED });
    qb.orderBy('module.sort');

    const modules = await qb.getMany();

    return this.nestModules(modules);
  }

  async findAll(): Promise<Module[]> {
    let qb = this.modulesRepository.createQueryBuilder('module');

    qb.where('module.state != :state', { state: BaseEntityState.DELETED });
    qb.orderBy('module.sort');

    const modules = await qb.getMany();

    return modules;
  }

  async findOne(id: number) {
    return this.modulesRepository.findOneBy({ id });
  }

  async update(id: number, updateModuleDto: UpdateModuleDto) {
    const module = await this.modulesRepository.findOneBy({ id });

    if (!module) return;

    module.date_updated = getSystemDatetime();

    const updatedPost = Object.assign(module, updateModuleDto);

    await this.modulesRepository.save(updatedPost);
  }

  async remove(id: number, forever: boolean = false) {
    const module = await this.modulesRepository.findOneBy({ id });

    if (!module) return;

    if (forever) {
      await this.modulesRepository.delete(id);
    } else {
      module.state = BaseEntityState.DELETED;
      module.date_deleted = getSystemDatetime();

      await this.modulesRepository.save(module);
    }
  }

  async enable(id: number) {
    const module = await this.modulesRepository.findOneBy({ id });

    if (!module) return;

    module.state = BaseEntityState.ENABLED;
    module.date_updated = getSystemDatetime();

    await this.modulesRepository.save(module);
  }

  async disable(id: number) {
    const module = await this.modulesRepository.findOneBy({ id });

    if (!module) return;

    module.state = BaseEntityState.DISABLED;
    module.date_updated = getSystemDatetime();

    await this.modulesRepository.save(module);
  }

  private nestModules(modules: Module[], parentId = 0) {
    let nestedModules: NestedModuleDto[] = [];

    modules.forEach(module => {
      if (module.parent_id == parentId) {
        let nestedModule = new NestedModuleDto();

        nestedModule = Object.assign(nestedModule, module);

        nestedModule.children = this.nestModules(modules, module.id);

        if (nestedModule.children.length) {
          nestedModule.type = 'collapse';
        } else {
          nestedModule.type = 'item';
        }

        nestedModules.push(nestedModule);
      }
    });

    return nestedModules;
  }

  async moduleExists(id: number): Promise<boolean> {
    return await this.modulesRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
