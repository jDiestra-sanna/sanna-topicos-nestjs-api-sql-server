import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileType } from './entities/file-type.entity';
import { FileTypesController } from './file-types.controller';
import { FileTypesService } from './file-types.service';
import { FileTypeExistsRule } from './decorators/file-type-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([FileType])],
  controllers: [FileTypesController],
  providers: [FileTypesService, FileTypeExistsRule],
  exports: [FileTypesService],
})
export class FileTypeModule {}
