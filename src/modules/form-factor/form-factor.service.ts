import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FormFactor } from './entities/form-factor.entity';
import { Repository } from 'typeorm';
import { CreateFormFactorDto } from './dto/create-form-factor.dto';
import { UpdateFormFactorDto } from './dto/update-form-factor.dto';
import { getSystemDatetime } from 'src/common/helpers/date';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { ReqQuery } from './dto/req-query.dto';

@Injectable()
export class FormFactorsService {
  constructor(@InjectRepository(FormFactor) private formFactorRepository: Repository<FormFactor>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<FormFactor>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.formFactorRepository.createQueryBuilder('form_factor');

    qb.where('form_factor.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.query) {
      qb.andWhere('CONCAT(form_factor.name) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(form_factor.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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
    // return await this.formFactorRepository.find()
  }

  async findOne(id: number) {
    const formFactor = await this.formFactorRepository.findOneBy({ id });
    if (!formFactor) return null;
    return formFactor;
  }

  async create(createFormFactorDto: CreateFormFactorDto) {
    const newFormFactor = await this.formFactorRepository.save({ ...createFormFactorDto });
    return newFormFactor.id;
  }

  async update(id: number, updateFormFactorDto: UpdateFormFactorDto) {
    const formFactor = await this.formFactorRepository.findOneBy({ id });
    if (!formFactor) return;
    formFactor.date_updated = getSystemDatetime();

    const updatedFormFactor = Object.assign(formFactor, updateFormFactorDto);
    await this.formFactorRepository.save(updatedFormFactor);
  }

  async remove(id: number, forever: boolean = false) {
    const formFactor = await this.formFactorRepository.findOneBy({ id });
    if (!formFactor) return;

    if (forever) {
      await this.formFactorRepository.delete(id);
    } else {
      formFactor.state = BaseEntityState.DELETED;
      formFactor.date_deleted = getSystemDatetime();
      await this.formFactorRepository.save(formFactor);
    }
  }

  async enable(id: number) {
    const formFactor = await this.formFactorRepository.findOneBy({ id });

    if (!formFactor) return;

    formFactor.state = BaseEntityState.ENABLED;
    formFactor.date_updated = getSystemDatetime();

    await this.formFactorRepository.save(formFactor);
  }

  async disable(id: number) {
    const formFactor = await this.formFactorRepository.findOneBy({ id });

    if (!formFactor) return;

    formFactor.state = BaseEntityState.DISABLED;
    formFactor.date_updated = getSystemDatetime();

    await this.formFactorRepository.save(formFactor);
  }

  async formFactorExists(id: number): Promise<boolean> {
    return await this.formFactorRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }

  async existsFormFactorName(name: string): Promise<boolean> {
    let qb = this.formFactorRepository.createQueryBuilder('ff');
    qb.where('ff.name = :name', { name });
    qb.andWhere('ff.state != :state', { state: BaseEntityState.DELETED });

    const count = await qb.getCount();
    return count > 0;
  }
}
