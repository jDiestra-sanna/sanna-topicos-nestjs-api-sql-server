import { AttendanceRecordsService } from '../attendance-records/attendance-records.service';
import { FileTypesService } from '../file-types/file-types.service';
import { Injectable } from '@nestjs/common';
import { MedicalCalendarsService } from '../medical-calendars/medical-calendars.service';
import { QueryFindAll } from '../users/dto/req-query-user-file.dto';
import { QueryForm } from './dto/req-query.dto';
import { ReqQuery as ReqQueryFT } from '../file-types/dto/req-query.dto';
import { UserFilesService } from '../users/user-files.services';
import * as fileHelper from 'src/common/helpers/file';
import * as path from 'node:path';
import { getSystemWeekday } from 'src/common/helpers/date';
import { RoleIds } from '../roles/entities/role.entity';
import { CampusConditionIds } from '../campus-conditions/entities/campus-condition.entity';
import { CampusConditionsService } from '../campus-conditions/campus-conditions.service';

@Injectable()
export class HealthTeamProfilesService {
  constructor(
    private medicalCalendarsService: MedicalCalendarsService,
    private attendanceRecordsService: AttendanceRecordsService,
    private fileTypesService: FileTypesService,
    private userFilesService: UserFilesService,
    private campusConditionsService: CampusConditionsService
  ) {}

  async findOneForm(query: QueryForm) {
    const medicalCalendarForm = await this.medicalCalendarsService.findOneForm(query);
    const userFiles = await this.userFilesService.findAll({
      ...new QueryFindAll(),
      user_id: query.user_id,
      limit: 100,
    });
    medicalCalendarForm.user['files'] = userFiles.items;

    const attendance_record = await this.attendanceRecordsService.findManyCurrentMonth(
      query.user_id,
      query.campus_id,
      query.month,
      query.year,
    );
    const fileTypesResult = await this.fileTypesService.findAll(new ReqQueryFT());

    const is_attending = await this.attendanceRecordsService.isUserAttending(query.user_id, query.campus_id);

    const weekday = getSystemWeekday();
    const today_schedule = medicalCalendarForm.campus.campus_schedule.find(schedule => schedule.day_id === weekday);

    if (query.logged_user_role_id === RoleIds.CLIENT) {
      medicalCalendarForm.campus.condition_id = is_attending ? CampusConditionIds.OPERATIVE : CampusConditionIds.PROGRAMMED
      const newCampusCondition = await this.campusConditionsService.findOne(medicalCalendarForm.campus.condition_id)
  
      medicalCalendarForm.campus.campus_condition.id = newCampusCondition.id
      medicalCalendarForm.campus.campus_condition.name = newCampusCondition.name
    }


    return {
      ...medicalCalendarForm,
      file_types: fileTypesResult.items,
      attendance_record,
      is_attending,
      today_schedule: today_schedule ?? null,
    };
  }

  async findOneUserFile(userFileId: number) {
    return await this.userFilesService.findOne(userFileId);
  }

  async findUserFiles(user_id: number, file_type_id: number = 0) {
    const userFiles = await this.userFilesService.findAll({
      ...new QueryFindAll(),
      user_id,
      file_type_id,
      limit: 100,
    });

    return userFiles.items;
  }

  async zipUserFiles(user_id: number, file_type_id: number = 0) {
    const userFiles = await this.findUserFiles(user_id, file_type_id);
    const folderPath = path.join(__dirname, '_downloading_');
    const zipFolder = `${Date.now()}.zip`;
    const zipFolderPath = path.join(__dirname, zipFolder);

    await fileHelper.createDir(folderPath);

    userFiles.forEach(async userFile => {
      const sourcePath = fileHelper.getLocalUriStaticFile(userFile.file.path);
      const destPath = path.join(folderPath, userFile.file.name);

      await fileHelper.copyFile(sourcePath, destPath);
    });

    await fileHelper.zipDirectory(folderPath, zipFolderPath);
    await fileHelper.removeDir(folderPath);

    return {
      zipFolderPath,
      zipFolder,
    };
  }
}
