import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Prescription } from './entities/prescription.entity';
import { Repository } from 'typeorm';
import { ReqQuery } from './dto/req-query';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { getSystemDatetime } from 'src/common/helpers/date';

@Injectable()
export class PrescriptionsService {
  constructor(@InjectRepository(Prescription) private prescriptionsRepository: Repository<Prescription>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<Prescription>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.prescriptionsRepository.createQueryBuilder('prescriptions');

    qb.leftJoinAndSelect('prescriptions.medicine', 'medicine');
    qb.leftJoinAndSelect('prescriptions.medical_consultation', 'medical_consultation');

    qb.andWhere('prescriptions.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.medicine_id) {
      qb.andWhere('prescriptions.medicine_id = :medicine_id', { medicine_id: req_query.medicine_id });
    }

    if (req_query.medical_consultation_id) {
      qb.andWhere('prescriptions.medical_consultation_id = :medical_consultation_id', {
        medical_consultation_id: req_query.medical_consultation_id,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(prescriptions.date_created AS DATE) BETWEEN :date_from AND :date_to', {
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
    const prescription = await this.prescriptionsRepository.findOne({
      where: { id },
      relations: ['medicine', 'medical_consultation'],
    });

    if (!prescription) return null;

    return prescription;
  }

  async create(createPrescriptionDto: CreatePrescriptionDto) {
    const newPrescription = await this.prescriptionsRepository.save({ ...createPrescriptionDto });

    if (!newPrescription) return null;

    return newPrescription;
  }

  async batchInsert(createPrescriptionDto: CreatePrescriptionDto[]) {
    await this.prescriptionsRepository
      .createQueryBuilder('prescriptions')
      .insert()
      .into(Prescription)
      .values(createPrescriptionDto)
      .execute();
  }

  async update(id: number, updatePrescriptionDto: UpdatePrescriptionDto) {
    const prescription = await this.prescriptionsRepository.findOneBy({ id });
    if (!prescription) return;

    prescription.date_updated = getSystemDatetime();
    const updatedPrescription = Object.assign(prescription, updatePrescriptionDto);
    await this.prescriptionsRepository.save(updatedPrescription);
  }

  async remove(id: number, forever: boolean = false) {
    const prescription = await this.prescriptionsRepository.findOneBy({ id });
    if (!prescription) return;

    if (forever) {
      await this.prescriptionsRepository.delete(id);
    } else {
      prescription.state = BaseEntityState.DELETED;
      prescription.date_deleted = getSystemDatetime();
      await this.prescriptionsRepository.save(prescription);
    }
  }

  async enable(id: number) {
    const prescription = await this.prescriptionsRepository.findOneBy({ id });
    if (!prescription) return;

    prescription.state = BaseEntityState.ENABLED;
    prescription.date_updated = getSystemDatetime();

    await this.prescriptionsRepository.save(prescription);
  }

  async disable(id: number) {
    const prescription = await this.prescriptionsRepository.findOneBy({ id });
    if (!prescription) return;

    prescription.state = BaseEntityState.DISABLED;
    prescription.date_updated = getSystemDatetime();

    await this.prescriptionsRepository.save(prescription);
  }
}
