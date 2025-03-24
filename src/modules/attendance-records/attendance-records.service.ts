import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterEntryTimeDto } from './dto/register-entry-time.dto';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { MedicalCalendar } from '../medical-calendars/entities/medical-calendar.entity';
import { getSystemDatetime } from 'src/common/helpers/date';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceRecordsService {
  constructor(
    @InjectRepository(AttendanceRecord) private attendanceRecordsRepository: Repository<AttendanceRecord>,
    @InjectRepository(MedicalCalendar) private medicalCalendarsRepository: Repository<MedicalCalendar>,
  ) {}

  async registerEntryTime(registerEntryTimeDto: RegisterEntryTimeDto) {
    await this.attendanceRecordsRepository
      .createQueryBuilder()
      .update()
      .set({
        leaving_time: getSystemDatetime(),
      })
      .where('day = :day', { day: registerEntryTimeDto.day })
      .andWhere('user_id = :user_id', { user_id: registerEntryTimeDto.user_id })
      .andWhere('leaving_time IS NULL')
      .execute();

    const newItem = await this.attendanceRecordsRepository.save({ ...registerEntryTimeDto });
    return newItem.id;
  }

  async registerLeavingTime(user_id: number, day: string, session_id: number, time: string, observation: string) {
    await this.attendanceRecordsRepository.update(
      { user_id, day, session_id },
      { leaving_time: time, leaving_observation: observation ?? null },
    );
  }

  async registeredLeavingTime(user_id: number, day: string) {
    const attendanceRecord = await this.attendanceRecordsRepository.findOneBy({ user_id, day });
    return !!attendanceRecord?.leaving_time;
  }

  async registeredEntryTime(user_id: number, day: string, session_id: number) {
    // const attendanceRecord = await this.attendanceRecordsRepository.findOneBy({ user_id, day });
    // return !!attendanceRecord?.entry_time;
    return await this.attendanceRecordsRepository.existsBy({ user_id, day, session_id });
  }

  async findOneBy(user_id: number, day: string) {
    return await this.attendanceRecordsRepository.findOneBy({ user_id, day });
  }

  async findOneByUserDaySession(user_id: number, day: string, session_id: number) {
    return await this.attendanceRecordsRepository.findOne({
      relations: ['campus', 'campus.client', 'campus.client.group'],
      where: { user_id, day, session_id },
    })
  }

  async findManyCurrentMonth(
    user_id: number,
    campus_id: number,
    month: number,
    year: number,
  ): Promise<AttendanceRecord[]> {
    return await this.attendanceRecordsRepository
      .createQueryBuilder('attendance_records')
      .select('attendance_records.day', 'day')
      .addSelect('MIN(attendance_records.entry_time)', 'first_entry')
      .addSelect('MAX(attendance_records.leaving_time)', 'last_exit')
      .groupBy('attendance_records.day')
      .orderBy('attendance_records.day', 'ASC')
      .where('attendance_records.user_id = :user_id', { user_id })
      .andWhere('attendance_records.campus_id = :campus_id', { campus_id })
      .andWhere('MONTH(attendance_records.day) = :month', { month })
      .andWhere('YEAR(attendance_records.day) = :year', { year })
      .getRawMany();
  }

  async findCurrentDayCount(campus_id: number): Promise<number> {
    return await this.attendanceRecordsRepository
      .createQueryBuilder('attendance_records')
      .where('attendance_records.campus_id = :campus_id', { campus_id })
      .andWhere('attendance_records.day = CAST(GETDATE() AS DATE)')
      .getCount();
  }

  async isUserAttending(user_id: number, campus_id: number) {
    return await this.attendanceRecordsRepository
      .createQueryBuilder('attendance_record')
      .where('attendance_record.user_id = :user_id', { user_id })
      .andWhere('attendance_record.campus_id = :campus_id', { campus_id })
      .andWhere('attendance_record.day = CAST(GETDATE() AS DATE)')
      .andWhere('attendance_record.leaving_time IS NULL')
      .getExists();
  }

  async isLeavingTimeCorrect(user_id: number, day: string, session_id: number, time: string) {
    let qb = this.attendanceRecordsRepository.createQueryBuilder();
    qb.where('user_id = :user_id', { user_id });
    qb.andWhere('day = :day', { day });
    qb.andWhere('entry_time <= :leaving_time', { leaving_time: time });
    qb.andWhere('session_id = :session_id', { session_id });

    return await qb.getExists();
  }

  async update(criteria: Partial<AttendanceRecord>, data: UpdateAttendanceDto) {
    await this.attendanceRecordsRepository.update(criteria, data);
  }

  async findLastRecordUserAttending(user_id: number) {
    return await this.attendanceRecordsRepository.createQueryBuilder('attendance_record')
    .where('attendance_record.user_id = :user_id', { user_id })
    .andWhere('attendance_record.day = CAST(GETDATE() AS DATE)')
    .andWhere('attendance_record.leaving_time IS NULL')
    .orderBy('attendance_record.day', 'DESC')
    .addOrderBy('attendance_record.entry_time', 'DESC')
    .getOne();
  }
}
