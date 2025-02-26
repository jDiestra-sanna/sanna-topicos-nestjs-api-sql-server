import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { getSystemDate } from 'src/common/helpers/date';
import { HealthTeamProfilesService } from './health-team-profiles.service';
import { MedicalCalendarsService } from '../medical-calendars/medical-calendars.service';
import { ReqQueryForm } from './dto/req-query.dto';
import { Response } from 'express';
import { rsp404, rspOk } from 'src/common/helpers/http-responses';
import { User } from '../users/entities/user.entity';
import * as fileHelper from 'src/common/helpers/file';
import * as path from 'node:path';

@Controller('health-team-profiles')
export class HealthTeamProfilesController {
  constructor(
    private readonly healthTeamProfilesServices: HealthTeamProfilesService,
    private readonly medicalCalendarsService: MedicalCalendarsService,
  ) {}

  @Get('form')
  async findOneForm(@Query() query: ReqQueryForm, @Res() res: Response, @AuthUser() authUser: User) {
    const currentDate = getSystemDate();

    const data = await this.healthTeamProfilesServices.findOneForm({
      ...query,
      campus_id: query.campus_id,
      user_id: query.user_id ?? authUser.id,
      day: currentDate,
      logged_user_role_id: authUser.role_id
    });

    return rspOk(res, data);
  }

  @Get('files/download')
  async downloadFiles(@Res() res: Response, @AuthUser() authUser: User) {
    const zipResponse = await this.healthTeamProfilesServices.zipUserFiles(authUser.id);

    res.download(zipResponse.zipFolderPath, zipResponse.zipFolder, async err => {
      await fileHelper.removeFile(zipResponse.zipFolderPath);
    });
  }

  @Get('files/:userFileId')
  async findOneUserFile(
    @Param('userFileId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userFileId: number,
    @Res() res: Response,
  ) {
    const userFile = await this.healthTeamProfilesServices.findOneUserFile(userFileId);
    if (!userFile) return rsp404(res);

    return rspOk(res, userFile);
  }

  @Get('files/:userFileId/download')
  async downloadUserFile(
    @Param('userFileId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userFileId: number,
    @Res() res: Response,
  ) {
    const userFile = await this.healthTeamProfilesServices.findOneUserFile(userFileId);
    if (!userFile) return rsp404(res);

    const filePath = fileHelper.getLocalUriStaticFile(userFile.file.path);

    if (!fileHelper.existsFile(filePath)) return rsp404(res);

    res.download(filePath, userFile.file.name);
  }

  @Get('file-types/:fileTypeId/files/download')
  async downloadFilesByType(
    @Param('fileTypeId', new ParseIntPipe({ errorHttpStatusCode: 400 })) fileTypeId: number,
    @Res() res: Response,
    @AuthUser() authUser: User,
  ) {
    const zipResponse = await this.healthTeamProfilesServices.zipUserFiles(authUser.id, fileTypeId);

    res.download(zipResponse.zipFolderPath, zipResponse.zipFolder, async err => {
      await fileHelper.removeFile(zipResponse.zipFolderPath);
    });
  }
}
