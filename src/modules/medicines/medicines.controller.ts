import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { MedicineService } from './medicines.service';
import { ParamIdDto } from 'src/common/dto/url-param.dto';
import { Response, query } from 'express';
import { paginatedRspOk, rsp201, rsp404, rspOk, rspOkDeleted, rspOkUpdated } from 'src/common/helpers/http-responses';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { ReqQuery } from './dto/req-query.dto';
import { EnabledDisabledDto } from 'src/common/dto/enabled-disabled.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { LogsService } from '../logs/logs.service';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { LogTargetsIds } from '../logs/entities/log-target';

@Controller('medicines')
export class MedicineController {
  constructor(
    private medicineService: MedicineService,
    private logsService: LogsService
  ) {}

  @Get()
  async findAll(@Query() query: ReqQuery, @Res() res: Response) {
    const result = await this.medicineService.findAll(query)
    return paginatedRspOk(res, result.items, result.total, result.limit, result.page)
  }

  @Get(':id')
  async findOne(@Param() params: ParamIdDto, @Res() res: Response) {
    const data = await this.medicineService.findOne(params.id);
    if (!data) return rsp404(res);
    return rspOk(res, data);
  }

  @Post()
  async create(@Body() createMedicineDto: CreateMedicineDto, @Res() res: Response, @AuthUser() authUser: User) {
    const medicine = await this.medicineService.create(createMedicineDto);
    
    if (!medicine) return rsp404(res)
    const medicineId = medicine.id

    this.logsService.create({
      log_type_id: LogTypesIds.CREATED,
      user_id: authUser.id,
      target_row_id: medicineId,
      target_row_label: createMedicineDto.name,
      log_target_id: LogTargetsIds.MEDICINE,
      data: JSON.stringify(medicine)
    })
    
    return rsp201(res, medicineId);
  }

  @Patch(':id')
  async update(@Param() params: ParamIdDto, @Body() updateMedicineDto: UpdateMedicineDto, @Res() res: Response, @AuthUser() authUser: User) {
    const medicine = await this.medicineService.findOne(params.id);
    if (!medicine) return rsp404(res);

    if (updateMedicineDto.code) {
      const existsCode = await this.medicineService.medicineExistsByCode(updateMedicineDto.code, medicine.id);
      if (existsCode) throw new BadRequestException('Código de medicina ya existe');
    }

    const dataChanged = this.logsService.getDataChangedJson(medicine, updateMedicineDto);

    if (dataChanged) {
      await this.medicineService.update(params.id, updateMedicineDto);

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        target_row_id: medicine.id,
        target_row_label: medicine.name,
        log_target_id: LogTargetsIds.MEDICINE,
        data: dataChanged
      })
    }

    await this.medicineService.update(params.id, updateMedicineDto);
    return rspOkUpdated(res);
  }

  @Delete(':id')
  async remove(@Param() params: ParamIdDto, @Res() res: Response, @AuthUser() authUser: User) {
    const medicine = await this.medicineService.findOne(params.id);
    if (!medicine) return rsp404(res);
    await this.medicineService.remove(params.id);

    this.logsService.create({
      log_type_id: LogTypesIds.DELETED,
      user_id: authUser.id,
      target_row_id: medicine.id,
      target_row_label: medicine.name,
      log_target_id: LogTargetsIds.MEDICINE
    })

    return rspOkDeleted(res);
  }

  @Patch('/:id/state')
  async updateState(
    @Param() params: ParamIdDto,
    @Body() updateStateDto: EnabledDisabledDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const medicine = await this.medicineService.findOne(params.id);

    if (!medicine) return rsp404(res);

    if (updateStateDto.state === BaseEntityState.ENABLED) {
      await this.medicineService.enable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.ENABLED,
        user_id: authUser.id,
        target_row_id: medicine.id,
        target_row_label: medicine.name,
        log_target_id: LogTargetsIds.MEDICINE,
      });
    }

    if (updateStateDto.state === BaseEntityState.DISABLED) {
      await this.medicineService.disable(params.id);

      this.logsService.create({
        log_type_id: LogTypesIds.DISABLED,
        user_id: authUser.id,
        target_row_id: medicine.id,
        target_row_label: medicine.name,
        log_target_id: LogTargetsIds.MEDICINE,
      });
    }
    return rspOk(res);
  }
}
