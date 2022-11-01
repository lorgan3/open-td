import { Loader, Sprite } from "pixi.js";
import { EntityType } from "../../../data/entity/entity";
import { Flier } from "./flier";
import { Regular } from "./regular";
import { Runner } from "./runner";
import { Tower } from "./tower";

export interface EntityRenderer extends Sprite {
  sync: () => void;
}

export type Constructor = new (data: any, loader: Loader) => EntityRenderer;

export const init = (loader: Loader) => {
  loader.add("runner", "./src/assets/animations/runner.json");
  loader.add("regular", "./src/assets/animations/regular.json");
  loader.add("flier", "./src/assets/animations/flier.json");
  loader.add("buildings", "./src/assets/buildings.json");
  loader.add("turret", "./src/assets/Turret.json");
  loader.add("flamethrower", "./src/assets/Flamethrower.json");
  loader.add("laser", "./src/assets/Laser.json");
  loader.add("mortar", "./src/assets/Mortar.json");
  loader.add("railgun", "./src/assets/Railgun.json");
};

export const OVERRIDES: Partial<Record<EntityType, Constructor>> = {
  [EntityType.Runner]: Runner,
  [EntityType.Slime]: Regular,
  [EntityType.Flier]: Flier,
  [EntityType.Tower]: Tower,
  [EntityType.Flamethrower]: Tower,
  [EntityType.Laser]: Tower,
  [EntityType.Mortar]: Tower,
  [EntityType.Railgun]: Tower,
};
