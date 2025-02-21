import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Allergy } from './entities/allergies.entity';
import { Repository } from 'typeorm';
import { ReqQuery } from './dto/req-query';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';
import { getSystemDatetime } from 'src/common/helpers/date';
import { BaseEntityState } from 'src/common/entities/base.entity';

@Injectable()
export class AllergiesService {
  constructor(@InjectRepository(Allergy) private allergiesRepository: Repository<Allergy>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<Allergy>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.allergiesRepository.createQueryBuilder('allergies');

    qb.leftJoinAndSelect('allergies.patient', 'patient');
    qb.where('allergies.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.patient_id) {
      qb.andWhere('allergies.patient_id = :patient_id', { patient_id: req_query.patient_id });
    }

    if (req_query.query) {
      qb.andWhere('CONCAT(allergies.food_allergy, allergies.drug_allergy) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(allergies.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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
    const allergy = await this.allergiesRepository.findOne({
      where: { id },
      relations: ['patient'],
    });

    if (!allergy) return null;

    return allergy;
  }

  async create(createAllergyDto: CreateAllergyDto) {
    const newAllergy = await this.allergiesRepository.save({ ...createAllergyDto });
    if (!newAllergy) return null;

    return newAllergy.id;
  }

  async update(id: number, updateAllergyDto: UpdateAllergyDto) {
    const allergy = await this.allergiesRepository.findOneBy({ id });
    if (!allergy) return;

    allergy.date_updated = getSystemDatetime();
    const updatedAllergy = Object.assign(allergy, updateAllergyDto);
    await this.allergiesRepository.save(updatedAllergy);
  }

  async remove(id: number, forever: boolean = false) {
    const allergy = await this.allergiesRepository.findOneBy({ id });
    if (!allergy) return;

    if (forever) {
      await this.allergiesRepository.delete(id);
    } else {
      allergy.state = BaseEntityState.DELETED;
      allergy.date_deleted = getSystemDatetime();
      await this.allergiesRepository.save(allergy);
    }
  }

  async enable(id: number) {
    const allergy = await this.allergiesRepository.findOneBy({ id });
    if (!allergy) return;

    allergy.state = BaseEntityState.ENABLED;
    allergy.date_updated = getSystemDatetime();

    await this.allergiesRepository.save(allergy);
  }

  async disable(id: number) {
    const allergy = await this.allergiesRepository.findOneBy({ id });
    if (!allergy) return;

    allergy.state = BaseEntityState.DISABLED;
    allergy.date_updated = getSystemDatetime();

    await this.allergiesRepository.save(allergy);
  }

  async allergyExists(id: number) {
    return await this.allergiesRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
