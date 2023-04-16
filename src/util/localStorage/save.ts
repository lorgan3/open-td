import { BuildControllerData } from "../../data/controllers/buildController";
import { DefaultManagerData } from "../../data/controllers/defaultManager";
import { MoneyControllerData } from "../../data/controllers/moneyController";
import { PowerControllerData } from "../../data/controllers/powerController";
import { UnlocksControllerData } from "../../data/controllers/unlocksController";
import { VisibilityControllerData } from "../../data/controllers/visibilityController";
import { WaveControllerData } from "../../data/controllers/waveController";

export interface Save {
  version: string;
  manager: DefaultManagerData;
  visibilityController: VisibilityControllerData;
  waveController: WaveControllerData;
  powerController: PowerControllerData;
  moneyController: MoneyControllerData;
  buildController: BuildControllerData;
  unlocksController: UnlocksControllerData;
}

// In an ideal world this returns `Save[K]` but typescript doesn't understand
export const saveReviver = <K extends keyof Save>(key: K, value: any): any => {
  return value;
};

export const saveReplacer = <K extends keyof Save>(
  key: K,
  value: Save[K]
): any => {
  return value;
};
