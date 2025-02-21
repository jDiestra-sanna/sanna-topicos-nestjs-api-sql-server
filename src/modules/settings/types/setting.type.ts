import { SettingNames } from '../entities/setting.entity';

type Setting = {
  [key in SettingNames]: string;
};

export default Setting;
