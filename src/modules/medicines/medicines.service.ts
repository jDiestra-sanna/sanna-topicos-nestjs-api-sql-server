import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medicine } from './entities/medicines.entity';
import { Repository } from 'typeorm';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { getSystemDatetime } from 'src/common/helpers/date';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { ReqQuery } from './dto/req-query.dto';

@Injectable()
export class MedicineService {
  constructor(@InjectRepository(Medicine) private medicineRepository: Repository<Medicine>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<Medicine>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.medicineRepository.createQueryBuilder('medicine');

    qb.leftJoinAndSelect('medicine.article_group', 'article_group');
    qb.leftJoinAndSelect('medicine.form_factor', 'form_factor');
    qb.where('medicine.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.form_factor_id) {
      qb.andWhere('medicine.form_factor_id = :form_factor_id', { form_factor_id: req_query.form_factor_id });
    }

    if (req_query.article_group_id) {
      qb.andWhere('medicine.article_group_id = :article_group_id', { article_group_id: req_query.article_group_id });
    }

    if (req_query.query) {
      qb.andWhere('CONCAT(medicine.name, medicine.code) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(medicine.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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
    const medicine = await this.medicineRepository.findOne({
      where: { id },
      relations: ['article_group', 'form_factor'],
    });
    if (!medicine) return null;
    return medicine;
  }

  async create(createMedicineDto: CreateMedicineDto) {
    const newMedicine = await this.medicineRepository.save({ ...createMedicineDto });
    if (!newMedicine) return null;
    return newMedicine;
  }

  async update(id: number, updateMedicineDto: UpdateMedicineDto) {
    const medicine = await this.medicineRepository.findOneBy({ id });
    if (!medicine) return;
    medicine.date_updated = getSystemDatetime();

    const updatedMedicine = Object.assign(medicine, updateMedicineDto);
    await this.medicineRepository.save(updatedMedicine);
  }

  async remove(id: number, forever: boolean = false) {
    const medicine = await this.medicineRepository.findOneBy({ id });
    if (!medicine) return;

    if (forever) {
      await this.medicineRepository.delete(id);
    } else {
      medicine.state = BaseEntityState.DELETED;
      medicine.date_deleted = getSystemDatetime();
      await this.medicineRepository.save(medicine);
    }
  }

  async enable(id: number) {
    const medicine = await this.medicineRepository.findOneBy({ id });
    if (!medicine) return;

    medicine.state = BaseEntityState.ENABLED;
    medicine.date_updated = getSystemDatetime();

    await this.medicineRepository.save(medicine);
  }

  async disable(id: number) {
    const medicine = await this.medicineRepository.findOneBy({ id });
    if (!medicine) return;

    medicine.state = BaseEntityState.DISABLED;
    medicine.date_updated = getSystemDatetime();

    await this.medicineRepository.save(medicine);
  }

  async medicineExists(id: number): Promise<boolean> {
    return await this.medicineRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }

  async medicineExistsByCode(code: string, excludeMedicineId: number = 0): Promise<boolean> {
    let qb = this.medicineRepository
      .createQueryBuilder()
      .where('code = :code', { code })
      .andWhere('state != :state', { state: BaseEntityState.DELETED });

    if (excludeMedicineId) {
      qb.andWhere('id != :excludeMedicineId', { excludeMedicineId });
    }

    return await qb.getExists();
  }
}
