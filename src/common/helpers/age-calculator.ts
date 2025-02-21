import { AgeFromDateString } from 'age-calculator';

export const isMinor = (birthDate: string): boolean => {
  const age = new AgeFromDateString(birthDate).age;
  return age < 18;
};

export const getAge = (birthDate: string): number => new AgeFromDateString(birthDate).age;
