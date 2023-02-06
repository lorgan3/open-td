import { assertNumber } from "../number";

export interface Achievements extends Record<string, number> {}

// In an ideal world this returns `Achievements[K]` but typescript doesn't understand
export const achievementsReviver = <K extends keyof Achievements>(
  key: K,
  value: any
): any => {
  if (key !== "") {
    return assertNumber(value);
  }

  return value;
};

export const achievementsReplacer = <K extends keyof Achievements>(
  key: K,
  value: Achievements[K]
): any => {
  return value;
};
