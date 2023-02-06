import { Achievements } from "./achievements";
import { Settings } from "./settings";

export type Reviver = (key: any, value: any) => any;

export type Replacer = (key: any, value: any) => any;

export interface Items {
  settings: Settings;
  achievements: Achievements;
}
