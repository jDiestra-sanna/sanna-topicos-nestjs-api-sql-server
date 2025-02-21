import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { Perms } from './entities/perms.entity';
import { ModuleModule } from '../modules/modules.module';
import { LogsModule } from '../logs/logs.module';
import { RoleExistsRule } from './decorators/role-exists.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Perms]), ModuleModule, LogsModule],
  controllers: [RolesController],
  providers: [RolesService, RoleExistsRule],
  exports: [RolesService],
})
export class RolesModule { }
