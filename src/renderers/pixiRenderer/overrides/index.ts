import { Container, Loader } from "pixi.js";
import { EntityType } from "../../../data/entity/entity";
import { Blueprint } from "./blueprint";
import { Flame } from "./flame";
import { Flier } from "./flier";
import { LaserBeam } from "./laserBeam";
import { Rail } from "./rail";
import { Regular } from "./regular";
import { Runner } from "./runner";
import { SimpleProjectile } from "./simpleProjectile";
import { Tank } from "./tank";
import { Tower } from "./tower";

export interface EntityRenderer extends Container {
  sync: (dt: number, full: boolean) => void;
}

export interface EntityRendererStatics {
  readonly layer: Container;
}

export type Constructor = (new (data: any, loader: Loader) => EntityRenderer) &
  EntityRendererStatics;

export const init = (loader: Loader) => {
  loader.add("runner", "./src/assets/animations/runner.json");
  loader.add("regular", "./src/assets/animations/regular.json");
  loader.add("flier", "./src/assets/animations/flier.json");
  loader.add("tank", "./src/assets/animations/tank.json");
  loader.add("buildings", "./src/assets/tiles/buildings.json");
  loader.add("turret", "./src/assets/animations/turret.json");
  loader.add("flamethrower", "./src/assets/animations/flamethrower.json");
  loader.add("laser", "./src/assets/animations/laser.json");
  loader.add("mortar", "./src/assets/animations/mortar.json");
  loader.add("railgun", "./src/assets/animations/railgun.json");
  loader.add("projectiles", "./src/assets/tiles/projectiles.json");
};

export const OVERRIDES: Partial<Record<EntityType, Constructor | null>> = {
  [EntityType.Runner]: Runner,
  [EntityType.Slime]: Regular,
  [EntityType.Flier]: Flier,
  [EntityType.Tank]: Tank,
  [EntityType.Tower]: Tower,
  [EntityType.Flamethrower]: Tower,
  [EntityType.Laser]: Tower,
  [EntityType.Mortar]: Tower,
  [EntityType.Railgun]: Tower,
  [EntityType.Bullet]: SimpleProjectile,
  [EntityType.Flame]: Flame,
  [EntityType.Rocket]: SimpleProjectile,
  [EntityType.Shockwave]: SimpleProjectile,
  [EntityType.LaserBeam]: LaserBeam,
  [EntityType.Rail]: Rail,
  [EntityType.Fence]: null,
  [EntityType.Wall]: null,
  [EntityType.ElectricFence]: null,
  [EntityType.Blueprint]: Blueprint,
};
