import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogTarget } from './entities/log-target';
import { BaseEntityState } from 'src/common/entities/base.entity';

@Injectable()
export class LogTargetsService {
  constructor(
    @InjectRepository(LogTarget)
    private logTargetsRepository: Repository<LogTarget>,
  ) {}

  async findAll(): Promise<LogTarget[]> {
    return await this.logTargetsRepository.find();
  }

  async logTargetExists(id: number): Promise<boolean> {
    return await this.logTargetsRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
