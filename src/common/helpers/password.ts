import * as bcrypt from 'bcrypt';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import * as zxcvbnEsEsPackage from '@zxcvbn-ts/language-es-es';

const options = {
  translations: {
    ...zxcvbnEnPackage.translations,
    ...zxcvbnEsEsPackage.translations,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
    ...zxcvbnEsEsPackage.dictionary,
  },
};

zxcvbnOptions.setOptions(options);

export { zxcvbn };

export const hashPassword = async (password: string, saltRounds: number = 10): Promise<string> => {
  return await bcrypt.hash(password, saltRounds);
};

export const comparePasswords = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
