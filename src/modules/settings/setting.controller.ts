import { Body, Controller, Get, ParseFilePipe, Patch, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { getUrlStaticFile } from 'src/common/helpers/file';
import { rspOk, rspOkUpdated } from 'src/common/helpers/http-responses';
import { CustomFileTypeValidator } from 'src/common/validators/file-type.validator';
import { CustomMaxFileSizeValidator } from 'src/common/validators/max-file-size.validator';
import { multerOptionsDefault } from 'src/config/multer.config';
import { UpdateSettingMapOneDto } from './dto/update-setting.dto';
import { SettingsService } from './settings.service';
import { LogsService } from '../logs/logs.service';
import { LogTypesIds } from '../logs/entities/log-type.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { LogTargetsIds } from '../logs/entities/log-target';
import { SettingNames } from './entities/setting.entity';
import { CustomFileExtensionValidator } from 'src/common/validators/file-extension.validator';

@Controller('setting')
export class SettingController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly logsService: LogsService,
  ) {}

  @Get()
  async mapToOne(@Res() res: Response) {
    let settingMapOne = await this.settingsService.getMappedToOne();

    delete settingMapOne[SettingNames.TOPICS_ATTENDANCE_TOLERANTE];
    delete settingMapOne[SettingNames.CORRELATIVES];
    delete settingMapOne[SettingNames.INTERVAL]

    return rspOk(res, settingMapOne);
  }

  @Patch()
  async updateMapOne(
    @Body() updateSettingMapOneDto: UpdateSettingMapOneDto,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const settingMapOne = await this.settingsService.getMappedToOne();
    const dataChangedJSON = this.logsService.getDataChangedJson(settingMapOne, updateSettingMapOneDto);

    if (dataChangedJSON) {
      await this.settingsService.updateMapOne(updateSettingMapOneDto);

      this.logsService.create({
        log_type_id: LogTypesIds.UPDATED,
        user_id: authUser.id,
        log_target_id: LogTargetsIds.SETTING,
        data: dataChangedJSON,
      });
    }

    return rspOkUpdated(res);
  }

  @Post('/logo-image')
  @UseInterceptors(FileInterceptor('file', multerOptionsDefault))
  async uploadLogo(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new CustomMaxFileSizeValidator({ maxSize: 1024 * 1024 }),
          new CustomFileTypeValidator({
            fileType: /(jpeg|png)/,
            message: 'Logo debe ser del tipo jpg o png',
          }),
          new CustomFileExtensionValidator({
            extensions: /(.jpeg|.png)/,
            message: 'Logo debe ser de extensión jpg ó png',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Res() res: Response,
  ) {
    await this.settingsService.updatePathPicLogo(file.filename);

    return rspOk(res, getUrlStaticFile(file.filename));
  }

  @Post('/favicon-image')
  @UseInterceptors(FileInterceptor('file', multerOptionsDefault))
  async uploadFavicon(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new CustomMaxFileSizeValidator({ maxSize: 1024 * 1024 }),
          new CustomFileTypeValidator({
            fileType: /(jpeg|ico|png)/,
            message: 'Favicon debe ser del tipo jpg, ico o png',
          }),
          new CustomFileExtensionValidator({
            extensions: /(.jpeg|.ico|.png)/,
            message: 'Favicon debe ser de la extensión .jpeg, .ico ó .png',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Res() res: Response,
  ) {
    await this.settingsService.updatePathPicFavicon(file.filename);

    return rspOk(res, getUrlStaticFile(file.filename));
  }
}
