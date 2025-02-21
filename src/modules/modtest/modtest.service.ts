import { Injectable } from '@nestjs/common';
import { CreateModtestDto } from './dto/create-modtest.dto';
import { UpdateModtestDto } from './dto/update-modtest.dto';

@Injectable()
export class ModtestService {
  create(createModtestDto: CreateModtestDto) {
    return 'This action adds a new modtest';
  }

  findAll() {
    return `This action returns all modtest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} modtest`;
  }

  update(id: number, updateModtestDto: UpdateModtestDto) {
    return `This action updates a #${id} modtest`;
  }

  remove(id: number) {
    return `This action removes a #${id} modtest`;
  }
}
