import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting, SettingNames } from './entities/setting.entity';
import { UpdateSettingMapOneDto } from './dto/update-setting.dto';
import { getUrlStaticFile } from 'src/common/helpers/file';
import SettingType from './types/setting.type';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  async findAll() {
    return await this.settingsRepository.find();
  }

  async findOneByName(name: SettingNames) {
    return await this.settingsRepository.findOneBy({ name });
  }

  async getMappedToOne() {
    const settings = await this.findAll();
    let settingMapOne = {};

    settings.forEach(setting => {
      if (setting.name === SettingNames.PIC_FAVICON) {
        setting.value = getUrlStaticFile(setting.value);
      }

      if (setting.name === SettingNames.PIC_LOGO) {
        setting.value = getUrlStaticFile(setting.value);
      }

      settingMapOne[setting.name] = setting.value;
    });

    return settingMapOne as SettingType;
  }

  async updateValueByName(name: SettingNames, value: string) {
    const setting = await this.settingsRepository.findOneBy({ name });
    if (!setting) return;
    setting.value = value;
    this.settingsRepository.save(setting);
  }

  async updateBySetting(setting: Setting) {
    this.settingsRepository.save(setting);
  }

  async updateMapOne(updateSettingMapOneDto: UpdateSettingMapOneDto) {
    Object.keys(updateSettingMapOneDto).forEach(async (key: SettingNames) => {
      const setting = await this.settingsRepository.findOneBy({ name: key });

      if (!setting) return;

      const updatedSetting = Object.assign(setting, {
        value: updateSettingMapOneDto[key],
      });

      this.settingsRepository.save(updatedSetting);
    });
  }

  async updatePathPicLogo(newPath: string) {
    const setting = await this.settingsRepository.findOneBy({
      name: SettingNames.PIC_LOGO,
    });

    if (!setting) return;

    const updatedSetting = Object.assign(setting, { value: newPath });

    this.settingsRepository.save(updatedSetting);
  }

  async updatePathPicFavicon(newPath: string) {
    const setting = await this.settingsRepository.findOneBy({
      name: SettingNames.PIC_FAVICON,
    });

    if (!setting) return;

    const updatedSetting = Object.assign(setting, { value: newPath });

    this.settingsRepository.save(updatedSetting);
  }
}
