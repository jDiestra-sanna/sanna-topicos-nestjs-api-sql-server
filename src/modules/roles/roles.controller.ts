import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { EnabledDisabledDto } from 'src/common/dto/enabled-disabled.dto';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { CreateRoleDto } from './dto/create-role.dto';
import { ReqQuery } from './dto/req-query.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { LogsService } from '../logs/logs.service';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogTargetsIds } from '../logs/entities/log-target';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserTypeIds } from '../users/entities/type-user.entity';
import { RoleIds } from './entities/role.entity';

@Controller('roles')
export class RolesController {
  constructor(
    private rolesService: RolesService,
    private logsService: LogsService,
  ) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response, @AuthUser() authUser: User) {
    const result = await this.rolesService.findAll(query);

    const itemsFiltered = result.items.filter(item => !(authUser.role_id !== RoleIds.ROOT && item.id === RoleIds.ROOT));

    return paginatedRspOk(res, itemsFiltered, itemsFiltered.length, result.limit, result.page);
  }

  @Get(':id')
  async findOne(@Param() params: ParamIdDto, @Res() res: Response, @AuthUser() authUser: User) {
    const data = await this.rolesService.findOne(params.id);

    if (!data) return rsp404(res);

    if (authUser.role_id !== RoleIds.ROOT && data.id === RoleIds.ROOT) {
      throw new ForbiddenException("Usted no tiene permisos para acceder a este recurso");
    }

    return rspOk(res, data);
  }

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto, @Res() res: Response, @AuthUser() authUser: User) {
    const role = await this.rolesService.create(createRoleDto, { user_type_id: UserTypeIds.USER });
    const idRole = role.id;

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: idRole,
      target_row_label: createRoleDto.name,
      log_target_id: LogTargetsIds.ROLE,
      data: JSON.stringify(role),
    });

    return rsp201(res, idRole);
  }

  @Patch(':id')
  async update(
    @Param() params: ParamIdDto,
    @Body() updateRoleDto: UpdateRoleDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const role = await this.rolesService.findOne(params.id);

    if (!role) return rsp404(res);

    if (authUser.role_id !== RoleIds.ROOT && role.id === RoleIds.ROOT) {
      throw new ForbiddenException("Usted no tiene permisos para modificar este recurso");
    }

    const dataChanged = this.logsService.getDataChangedJson(role, updateRoleDto);
    await this.rolesService.update(params.id, updateRoleDto);

    if (dataChanged) {
      const { perms, ...result } = JSON.parse(dataChanged);

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: role.id,
        target_row_label: role.name,
        log_target_id: LogTargetsIds.ROLE,
        data: JSON.stringify({ ...result, perms: updateRoleDto.perms }),
      });
    }

    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(@Param() params: ParamIdDto, @Res() res: Response, @AuthUser() authUser: User) {
    const role = await this.rolesService.findOne(params.id);

    if (!role) return rsp404(res);

    if (authUser.role_id !== RoleIds.ROOT && role.id === RoleIds.ROOT) {
      throw new ForbiddenException("Usted no tiene permisos para eliminar este recurso");
    }

    await this.rolesService.remove(params.id);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: role.id,
      target_row_label: role.name,
      log_target_id: LogTargetsIds.ROLE,
    });

    return rspOkDeleted(res);
  }

  @Patch('/:id/state')
  async updateState(
    @Param() params: ParamIdDto,
    @Body() updateStateDto: EnabledDisabledDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const role = await this.rolesService.findOne(params.id);

    if (!role) return rsp404(res);

    if (authUser.role_id !== RoleIds.ROOT && role.id === RoleIds.ROOT) {
      throw new ForbiddenException("Usted no tiene permisos para modificar este recurso");
    }

    if (updateStateDto.state === BaseEntityState.ENABLED) {
      await this.rolesService.enable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.ENABLED,
        user_id: authUser.id,
        target_row_id: role.id,
        target_row_label: role.name,
        log_target_id: LogTargetsIds.ROLE,
      });
    }

    if (updateStateDto.state === BaseEntityState.DISABLED) {
      await this.rolesService.disable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.DISABLED,
        user_id: authUser.id,
        target_row_id: role.id,
        target_row_label: role.name,
        log_target_id: LogTargetsIds.ROLE,
      });
    }

    return rspOk(res);
  }
}
