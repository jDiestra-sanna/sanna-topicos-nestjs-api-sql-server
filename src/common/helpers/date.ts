import { DateTime, DurationUnits, Settings } from 'luxon';
import { DiffMilitaryTimeArgs } from './date.interface';

Settings.defaultZone = 'America/Lima';

export const getSystemDatetime = (): string => {
  return DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss');
};

export const getSystemDate = (): string => {
  return DateTime.local().toFormat('yyyy-MM-dd');
};

export const getSystemTime = (): string => {
  return DateTime.local().toFormat('HH:mm:ss');
};

/** Lunes -> 1, Domingo -> 7 */
export const getSystemWeekday = (): number => {
  return DateTime.fromISO(getSystemDate()).weekday;
};

/**
 * Convierte una marca de tiempo unix a una cadena de fecha YYYY-MM-DD HH:MM:SS
 */
export const timestampToDate = (timestamp: number) => {
  const dt = DateTime.fromSeconds(timestamp);
  return dt.toFormat('yyyy-MM-dd HH:mm:ss');
};

export function isValidTime(time: string, format: string = 'HH:mm'): boolean {
  const parsedTime = DateTime.fromFormat(time, format);
  return parsedTime.isValid;
}


/**
 * Calcula la diferencia entre dos horas militares en un formato especificado.
 * @param {Object} args - Los argumentos de la función.
 * @param {string} args.startTime - La hora de inicio en formato militar (por ejemplo, "10:00").
 * @param {string} args.endTime - La hora de finalización en formato militar (por ejemplo, "15:30").
 * @param {string} [args.format= 'HH:mm'] - El formato de las horas militares. Por defecto, es 'HH:mm'.
 * @param {string[]} [args.units= ['hours', 'minutes', 'seconds']] - Las unidades en las que se desea calcular la diferencia. Por defecto, son ["hours", "minutes", "seconds"].
 * @returns {Object} Un objeto que contiene la diferencia entre las dos horas en las unidades especificadas.
 */
export const diffMilitaryTime = ({
  startTime,
  endTime,
  format = 'HH:mm',
  units = ['hours', 'minutes', 'seconds'],
}: DiffMilitaryTimeArgs) => {
  const dateStart = DateTime.fromFormat(startTime, format);
  const dateEnd = DateTime.fromFormat(endTime, format);

  const diff = dateEnd.diff(dateStart, units).toObject();
  return diff;
};

export const getCurrentYear = (): number => {
  return DateTime.now().year;
}

export const getCurrentMonth = (): number => {
  return DateTime.now().month;
}

export const getCurrentDayNumber = (): number => {
  return DateTime.now().day;
}