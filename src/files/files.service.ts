import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFileDto } from './dto/create-file.dto';
import { File } from './entities/file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  async findOne(id: number): Promise<File> {
    return await this.filesRepository.findOneBy({ id });
  }

  async create(createFileDto: CreateFileDto): Promise<number> {
    const newFile = await this.filesRepository.save(createFileDto);
    return newFile.id;
  }

  async remove(id: number) {
    const file = await this.filesRepository.findOneBy({ id });
    if (!file) return;

    await this.filesRepository.delete(id);
  }

  async fileExists(id: number): Promise<boolean> {
    return await this.filesRepository.createQueryBuilder().where('id = :id', { id }).getExists();
  }
}
