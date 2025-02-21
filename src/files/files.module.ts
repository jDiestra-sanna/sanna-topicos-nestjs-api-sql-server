import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { LogsModule } from 'src/modules/logs/logs.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileExistsRule } from './decorators/file-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([File]), LogsModule],
  controllers: [FilesController],
  providers: [FilesService, FileExistsRule],
  exports: [FilesService],
})
export class FileModule {}
