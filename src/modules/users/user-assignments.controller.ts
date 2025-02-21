import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { LogTargetsIds } from '../logs/entities/log-target';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogsService } from '../logs/logs.service';
import { UserAssignmentCreationRequestDto } from './dto/create-user-assignment.dto';
import { ReqQueryUserAssignment } from './dto/req-query-user-assignment.dto';
import { UpdateUserAssignmentDto } from './dto/update-user-assignment.dto';
import { User } from './entities/user.entity';
import { UserAssignmentsService } from './user-assignments.service';
import { UsersService } from './users.service';
import { CampusService } from '../campus/campus.service';
import { getEnumKey } from 'src/common/helpers/generic';
import { ClientLevelIds } from '../client-levels/entities/client-level.entity';

@Controller('users/:userId/assignments')
export class UserAssignmentsController {
  constructor(
    private usersService: UsersService,
    private userAssignmentsService: UserAssignmentsService,
    private logsService: LogsService,
    private campusesService: CampusService,
  ) {}

  @Get()
  async findAll(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
    @Query() query: ReqQueryUserAssignment,
    @Res() res: Response,
  ) {
    const result = await this.userAssignmentsService.findAll({ ...query, user_id: userId });

    return paginatedRspOk(res, result.items, result.total, result.limit, result.page);
  }

  @Get(':id')
  async findOne(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Res() res: Response,
  ) {
    const data = await this.userAssignmentsService.findOne(id);
    if (!data) return rsp404(res);

    const is = await this.userAssignmentsService.isAssignmentOfUser(id, userId);
    if (!is) throw new BadRequestException('Id de asignacion no pertenece a id de usuario');

    return rspOk(res, data);
  }

  @Post()
  async create(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
    @Body() userAssigmentCreationRequestDto: UserAssignmentCreationRequestDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new BadRequestException('Id de usuario no existe');

    const clientLevelId = userAssigmentCreationRequestDto.client_level_id;
    const organizationalEntityId = userAssigmentCreationRequestDto.organizational_entity_id;

    const campusesIds = await this.campusesService.findCampusesIdsByOrgEntity(clientLevelId, organizationalEntityId);

    if (!campusesIds.length) throw new BadRequestException('No se encontraron sedes de la entidad organizacional');

    const assignments = campusesIds.map(campus => ({ campus_id: campus.id, user_id: userId }));

    await this.userAssignmentsService.batchDelete(userId);
    const userAssignmentIds = await this.userAssignmentsService.batchInsert(assignments);
    
    await this.usersService.enable(user.id);
    await this.usersService.update(user.id, { client_level_id: clientLevelId });
    
    const clientLevelKey = getEnumKey(clientLevelId, ClientLevelIds);
    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: user.id,
      target_row_label: user.name,
      log_target_id: LogTargetsIds.USER_ASSIGNMENT,
      data: JSON.stringify({
        client_level_name: clientLevelKey,
        client_level_id: clientLevelId,
        sedes: userAssignmentIds,
      }),
    });

    return rsp201(res, userAssignmentIds);
  }

  @Patch()
  async update(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
    @Body() updateUserAssigmentDto: UpdateUserAssignmentDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const user = await this.usersService.findOne(userId);
    if (!user) return rsp404(res, 'Usuario no encontrado');

    const clientLevelId = updateUserAssigmentDto.client_level_id;
    const organizationalEntityId = updateUserAssigmentDto.organizational_entity_id;

    const userAssignmentIds = await this.userAssignmentsService.findManyByUser(user.id);

    await this.userAssignmentsService.batchDelete(userId);

    const campusesIds = await this.campusesService.findCampusesIdsByOrgEntity(clientLevelId, organizationalEntityId);
    if (!campusesIds) return new BadRequestException('No se encontraron sedes de la entidad organizacional');
    const assignments = campusesIds.map(campus => ({ campus_id: campus.id, user_id: userId }));

    await this.userAssignmentsService.batchInsert(assignments);
    await this.usersService.enable(user.id);

    this.logsService.create({
      log_type_id: LogTypesIds.UPDATED,
      user_id: authUser.id,
      target_row_id: user.id,
      target_row_label: user.name,
      log_target_id: LogTargetsIds.USER_ASSIGNMENT,
      data: JSON.stringify({ old: userAssignmentIds, new: campusesIds }),
    });

    return rspOkUpdated(res);
  }

  @Delete()
  async remove(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new BadRequestException('Id de usuario no existe');

    await this.userAssignmentsService.batchDelete(user.id);
    await this.usersService.disable(user.id);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: user.id,
      target_row_label: user.name,
      log_target_id: LogTargetsIds.USER_ASSIGNMENT,
    });

    return rspOkDeleted(res);
  }
}
