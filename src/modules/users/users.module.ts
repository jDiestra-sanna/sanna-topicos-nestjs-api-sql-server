import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserUniqueEmailValidator } from '../../common/validators/unique-user-email.validator';
import { LogsModule } from '../logs/logs.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UserType } from './entities/type-user.entity';
import { UserAssigment } from './entities/user-assignment.entity';
import { UserFile } from './entities/user-file.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserFilesController } from './user-files.controller';
import { UserAssignmentsController } from './user-assignments.controller';
import { UserFilesService } from './user-files.services';
import { UserAssignmentsService } from './user-assignments.service';
import { UserPredictablePassword } from 'src/common/validators/password-user-predictable.validator';
import { CampusModule } from '../campus/campus.module';
import { ClientLevel } from '../client-levels/entities/client-level.entity';
import { UserExistsRule } from './decorators/user-exists.decorator';
import ExcelJSService from 'src/exceljs/exceljs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserType, UserAssigment, UserFile, ClientLevel]),
    SessionsModule,
    LogsModule,
    CampusModule,
  ],
  controllers: [UsersController, UserFilesController, UserAssignmentsController],
  providers: [
    UsersService,
    UserFilesService,
    UserAssignmentsService,
    UserUniqueEmailValidator,
    UserPredictablePassword,
    UserExistsRule,
    ExcelJSService
  ],
  exports: [UsersService, UserFilesService, UserAssignmentsService, TypeOrmModule],
})
export class UsersModule {}
