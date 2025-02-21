import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum SettingNames {
  ADDRESS = 'address',
  BRAND = 'brand',
  CMS_VERSION = 'cms_version',
  COIN = 'coin',
  COLOR_ACCENT = 'color_accent',
  COLOR_PRIMARY = 'color_primary',
  COUNTRY_CODE = 'country_code',
  EMAIL = 'email',
  ENTRY_TIME = 'entry_time',
  INTERVAL = 'interval',
  LANGUAGE = 'language',
  NAME = 'name',
  PHONE = 'phone',
  PIC_FAVICON = 'pic_favicon',
  PIC_LOGO = 'pic_logo',
  RUC = 'ruc',
  SESSION_LIMIT = 'session_limit',
  TIMEZONE = 'timezone',
  WEBSITE = 'website',
  CORRELATIVES = 'correlatives',
  TOPICS_ATTENDANCE_TOLERANTE = 'topics_attendance_tolerance',
  MEDICAL_CALENDAR_DAYS_MIN_HOURS = 'medical_calendar_days_min_hours'
}

@Entity({ name: 'settings' })
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: SettingNames;

  @Column({ type: 'varchar', length: 5000 })
  value: string;

  @Column({ default: '' })
  description: string;
}
