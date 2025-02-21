import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogType } from './entities/log-type.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';

@Injectable()
export class LogTypesService {
  constructor(
    @InjectRepository(LogType)
    private logTypesRepository: Repository<LogType>,
  ) {}

  async findAll(): Promise<LogType[]> {
    return await this.logTypesRepository.find();
  }

  async logTypeExists(id: number): Promise<boolean> {
    return await this.logTypesRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }
}
