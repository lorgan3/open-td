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
