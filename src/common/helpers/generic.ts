import { Request } from 'express';
import { ApiAlias } from 'src/config/api-alias.config';

export const hi = () => console.log('hi world');

export const extractTokenFromHeader = (request: Request): string | undefined => {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
};

export const getEndpointByUrl = (url: string) => `${ApiAlias.v1}/${url}`;

export const existsDuplicatedInArray = (items: Array<string | number | boolean>) => {
  return items.filter((item, index) => items.indexOf(item) !== index).length > 0;
};

export const getEnumKey = (value: number, enumerator) => {
  const entry = Object.entries(enumerator).find(([key, val]) => val === value);
  return entry ? entry[0] : undefined;
};

export const castBooleansToYesNo = (obj: any) => {
  for (const key in obj) {
    if (typeof obj[key] === 'boolean') {
      obj[key] = obj[key] ? 'Sí' : 'No';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      castBooleansToYesNo(obj[key]);
    }
  }
};

export const decodeId = (encodedId?: string): number | null => {
  if (!encodedId) return null;

  const decoded = Buffer.from(encodedId, 'base64').toString('utf8');

  const [salt, id, timestamp] = decoded.split('_');

  if (salt !== 'sanna') {
    return null;
  }

  return parseInt(id);

}