import { DurationUnits } from 'luxon';

type DiffMilitaryTimeFormat = 'HH:mm:ss' | 'HH:mm';

export interface DiffMilitaryTimeArgs {
  startTime: string;
  endTime: string;
  format?: DiffMilitaryTimeFormat;
  units?: DurationUnits;
}
